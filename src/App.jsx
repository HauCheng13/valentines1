import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'
import valentineImg1 from './assets/valentinepic.jpg'
import penguinImg from './assets/penguin.jpg'

function App() {
  const [yesPressed, setYesPressed] = useState(false)
  const [noPos, setNoPos] = useState({ top: 'auto', left: 'auto', position: 'relative' })
  const [btnSize, setBtnSize] = useState(null)
  const [noAttempts, setNoAttempts] = useState(0)
  const confettiCanvasRef = useRef(null)

  const handleReset = () => {
    setYesPressed(false)
    setNoAttempts(0)
    setNoPos({ top: 'auto', left: 'auto', position: 'relative' })
    setBtnSize(null)
  }

  const noBtnRef = useRef(null)
  const containerRef = useRef(null)

  // Floating Hearts logic
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const symbols = ['❤', '💖', '💕', '💗']
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 100 + 'vw',
      duration: Math.random() * 3 + 4 + 's',
      delay: Math.random() * 5 + 's'
    }))
    setHearts(newHearts)
  }, [])

  // Runaway No Button Logic
  const lastMoveTime = useRef(0)

  const moveButton = useCallback(() => {
    if (!noBtnRef.current || !containerRef.current) return

    // Update timestamp for throttling
    lastMoveTime.current = Date.now()
    setNoAttempts((count) => count + 1)

    const btnRect = noBtnRef.current.getBoundingClientRect()

    // Capture initial button size
    if (!btnSize) {
      setBtnSize({ width: btnRect.width, height: btnRect.height })
    }

    const containerRect = containerRef.current.getBoundingClientRect()

    const btnWidth = btnRect.width
    const btnHeight = btnRect.height

    // Calculate available space slightly padded
    const padding = 20
    // Calculate available space
    // random value between padding and (width - btnWidth - padding)
    const maxLeft = containerRect.width - btnWidth - padding
    const maxTop = containerRect.height - btnHeight - padding

    const randomX = Math.max(padding, Math.random() * maxLeft)
    const randomY = Math.max(padding, Math.random() * maxTop)

    setNoPos({
      position: 'absolute',
      left: `${randomX}px`,
      top: `${randomY}px`
      // removed fixed positioning and zIndex to keep it inside container context
    })
  }, [])

  // Proximity trigger
  useEffect(() => {
    if (yesPressed) return

    const handleMouseMove = (e) => {
      if (!noBtnRef.current) return

      const btnRect = noBtnRef.current.getBoundingClientRect()
      const btnCenter = {
        x: btnRect.left + btnRect.width / 2,
        y: btnRect.top + btnRect.height / 2
      }

      const distance = Math.sqrt(
        Math.pow(e.clientX - btnCenter.x, 2) +
        Math.pow(e.clientY - btnCenter.y, 2)
      )

      // Trigger if cursor is close (e.g. within 150px) AND we haven't moved recently
      if (distance < 200 && Date.now() - lastMoveTime.current > 100) {
        moveButton()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [yesPressed, moveButton])

  // Confetti Logic
  useEffect(() => {
    if (yesPressed && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      let particles = []
      const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd6ff', '#e0aaff']

      function ConfettiParticle() {
        this.x = Math.random() * canvas.width
        this.y = -20
        this.size = Math.random() * 8 + 4
        this.speedY = Math.random() * 3 + 2
        this.speedX = Math.random() * 2 - 1
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.rotation = Math.random() * 360
      }

      ConfettiParticle.prototype.update = function () {
        this.y += this.speedY
        this.x += this.speedX
        this.rotation += 2
      }

      ConfettiParticle.prototype.draw = function () {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation * Math.PI / 180)
        ctx.fillStyle = this.color
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        ctx.restore()
      }

      // Spawn particles
      for (let i = 0; i < 150; i++) {
        setTimeout(() => {
          particles.push(new ConfettiParticle())
        }, i * 5)
      }

      const animateConfetti = () => {
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach((p, index) => {
          p.update()
          p.draw()
          if (p.y > canvas.height) {
            particles.splice(index, 1)
          }
        })

        if (particles.length > 0) {
          requestAnimationFrame(animateConfetti)
        }
      }

      animateConfetti()

      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [yesPressed])

  return (
    <>
      {/* Background Hearts */}
      <div className="bg-hearts">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: heart.left,
              animationDuration: heart.duration,
              animationDelay: heart.delay
            }}
          >
            {heart.symbol}
          </div>
        ))}
      </div>

      {!yesPressed ? (
        <div className="container" ref={containerRef}>
          <img src={valentineImg1} alt="Us" className="valentine-img" />
          <h1>Be my Valentine? 💗</h1>
          <div className="buttons">
            <button
              className="btn-yes"
              onClick={() => setYesPressed(true)}
            >
              Yes 💕
            </button>
            {/* Placeholder to keep layout stable */}
            {noPos.position === 'absolute' && btnSize && (
              <div style={{ width: btnSize.width, height: btnSize.height }} />
            )}
            <button
              ref={noBtnRef}
              className="btn-no"
              style={noPos}
              onMouseOver={moveButton}
              onTouchStart={moveButton}
              onClick={moveButton}
            >
              No 🙅‍♀️
            </button>
          </div>
          <div className="no-attempts" key={noAttempts}>Attempts to click No: {noAttempts}</div>
        </div>
      ) : (
        <>
          <div className="container success-message" style={{ display: 'block' }}>
            <img src={penguinImg} alt="Penguin" className="penguin-img" />
            <h1 className="success-text">HEY Miss.Trang</h1>
            <p className="sub-text">It's just for fun okayy 🤣🤣</p>
            <button className="btn-yes" onClick={handleReset}>Back</button>
          </div>
          <canvas ref={confettiCanvasRef} id="confetti"></canvas>
        </>
      )}
    </>
  )
}

export default App






