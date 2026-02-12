import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'
import valentineImg1 from './assets/valentinepic.jpg'
import penguinImg from './assets/penguin.jpg'

function App() {
  const [yesPressed, setYesPressed] = useState(false)
  const [noPos, setNoPos] = useState({ top: 'auto', left: 'auto', position: 'relative' })
  const [btnSize, setBtnSize] = useState(null)
  const [noAttempts, setNoAttempts] = useState(0)
  const [now, setNow] = useState(new Date())
  const confettiCanvasRef = useRef(null)
  const confettiAnimRef = useRef(null)

  const handleReset = () => {
    setYesPressed(false)
    setNoAttempts(0)
    setNoPos({ top: 'auto', left: 'auto', position: 'relative' })
    setBtnSize(null)
  }

  const noBtnRef = useRef(null)
  const containerRef = useRef(null)

  // Falling snow logic
  const [snowflakes, setSnowflakes] = useState([])

  useEffect(() => {
    const newSnowflakes = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.5 + 0.3,
      duration: Math.random() * 2 + 2.5 + 's',
      delay: Math.random() * 2 + 's'
    }))
    setSnowflakes(newSnowflakes)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(id)
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

  const clearConfetti = useCallback(() => {
    if (!confettiCanvasRef.current) return

    const canvas = confettiCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (confettiAnimRef.current) {
      cancelAnimationFrame(confettiAnimRef.current)
      confettiAnimRef.current = null
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const spawnConfettiBurst = useCallback((count = 30) => {
    if (!confettiCanvasRef.current || yesPressed) return

    const canvas = confettiCanvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (confettiAnimRef.current) {
      cancelAnimationFrame(confettiAnimRef.current)
    }

    const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd6ff', '#e0aaff']
    const originX = canvas.width / 2
    const originY = Math.min(canvas.height * 0.35, 260)

    let particles = Array.from({ length: count }).map(() => ({
      x: originX + (Math.random() - 0.5) * 120,
      y: originY + (Math.random() - 0.5) * 40,
      size: Math.random() * 6 + 3,
      speedY: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0
    }))

    const drawParticle = (p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation * Math.PI / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        p.rotation += 6
        p.life += 1
      })
      particles.forEach(drawParticle)
      particles = particles.filter((p) => p.life < 50)

      if (particles.length > 0) {
        confettiAnimRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animate()
  }, [yesPressed])

  // Confetti Logic
  useEffect(() => {
    if (!confettiCanvasRef.current) return

    const canvas = confettiCanvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()

    if (!yesPressed) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    if (confettiAnimRef.current) {
      cancelAnimationFrame(confettiAnimRef.current)
    }

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

    for (let i = 0; i < 150; i++) {
      setTimeout(() => {
        particles.push(new ConfettiParticle())
      }, i * 5)
    }

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, index) => {
        p.update()
        p.draw()
        if (p.y > canvas.height) {
          particles.splice(index, 1)
        }
      })

      if (particles.length > 0) {
        confettiAnimRef.current = requestAnimationFrame(animateConfetti)
      }
    }

    animateConfetti()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (confettiAnimRef.current) {
        cancelAnimationFrame(confettiAnimRef.current)
      }
    }
  }, [yesPressed])

  const formatTime = (timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeStyle: 'medium'
    }).format(now)
  }

  return (
    <>
      {/* Background Snow */}
      <div className="bg-snow">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: flake.left,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay
            }}
          />
        ))}
      </div>

      {!yesPressed ? (
        <div className="container" ref={containerRef}>
          <div className="time-jp">{formatTime('Asia/Tokyo')}</div>
          <img src={valentineImg1} alt="Us" className="valentine-img" />
          <h1>Can I treat you dinner one day</h1>
          <div className="buttons">
            <button
              className="btn-yes"
              onClick={() => setYesPressed(true)}
              onMouseEnter={() => spawnConfettiBurst(40)}
              onMouseLeave={clearConfetti}
            >
              Yes 😊
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
            <div className="time-jp">{formatTime('Asia/Tokyo')}</div>
            <img src={penguinImg} alt="Penguin" className="penguin-img" />
            <h1 className="success-text">Heyy Ms.Trang</h1>
            <p className="sub-text">Had some fun with this instead of doing something productive 🤣🤣</p>
            <button className="btn-yes" onClick={handleReset}>Back</button>
          </div>
        </>
      )}
      <canvas ref={confettiCanvasRef} id="confetti"></canvas>
    </>
  )
}

export default App

