import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

export function AnimatedCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false }) // Optimización de contexto
    if (!ctx) return

    let particles: Particle[] = []
    let animationFrame: number
    const particleCount = 80 // Un poco más denso
    const connectionDist = 120
    const mouseDist = 150

    const init = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, // Movimiento más elegante
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
      }))
    }

    const draw = () => {
      // Detectar color del tema actual del DOM
      const isDark = document.documentElement.classList.contains('dark')
      const bgColor = isDark ? '#0f172a' : '#f8fafc'
      const pColor = isDark ? '100, 150, 255' : '50, 100, 200'

      // Fondo sólido (más eficiente que fillRect con opacity 0.02 para trail)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        
        // Movimiento
        p.x += p.vx
        p.y += p.vy

        // Rebotes
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Interacción con ratón (opcional pero le da un toque pro)
        const dxm = mouseRef.current.x - p.x
        const dym = mouseRef.current.y - p.y
        const distM = Math.sqrt(dxm * dxm + dym * dym)
        if (distM < mouseDist) {
          p.x -= dxm * 0.02
          p.y -= dym * 0.02
        }

        // Dibujar partícula
        ctx.fillStyle = `rgba(${pColor}, 0.5)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Dibujar líneas (Optimizado: solo comparamos con partículas siguientes)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDist) {
            ctx.strokeStyle = `rgba(${pColor}, ${0.2 * (1 - dist / connectionDist)})`
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
      animationFrame = requestAnimationFrame(draw)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    init()
    draw()

    window.addEventListener('resize', init)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', init)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
    />
  )
}