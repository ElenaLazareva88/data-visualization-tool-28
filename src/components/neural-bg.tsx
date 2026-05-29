import { useEffect, useRef } from "react"

interface Neuron {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: "red" | "blue"
  pulsePhase: number
  pulseSpeed: number
  originCorner: number
}

function initNeuron(W: number, H: number, corner: number): Neuron {
  const spread = 0.35
  let startX = 0, startY = 0
  let vxBase = 0, vyBase = 0

  switch (corner) {
    case 0: startX = Math.random() * W * spread; startY = Math.random() * H * spread; vxBase = 0.4; vyBase = 0.4; break
    case 1: startX = W - Math.random() * W * spread; startY = Math.random() * H * spread; vxBase = -0.4; vyBase = 0.4; break
    case 2: startX = Math.random() * W * spread; startY = H - Math.random() * H * spread; vxBase = 0.4; vyBase = -0.4; break
    default: startX = W - Math.random() * W * spread; startY = H - Math.random() * H * spread; vxBase = -0.4; vyBase = -0.4; break
  }

  const angle = (Math.random() - 0.5) * Math.PI * 0.6
  const speed = 0.2 + Math.random() * 0.3
  const cos = Math.cos(angle), sin = Math.sin(angle)

  return {
    x: startX,
    y: startY,
    vx: (vxBase * cos - vyBase * sin) * speed,
    vy: (vxBase * sin + vyBase * cos) * speed,
    radius: 1.5 + Math.random() * 2,
    color: corner === 0 || corner === 3 ? "red" : "blue",
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.025 + Math.random() * 0.03,
    originCorner: corner,
  }
}

// Определяем уровень производительности устройства
function detectPerformanceTier(): "low" | "mid" | "high" {
  const cores = navigator.hardwareConcurrency || 2
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 2
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  if (isMobile || cores <= 2 || mem <= 2) return "low"
  if (cores <= 4 || mem <= 4) return "mid"
  return "high"
}

export function NeuralBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const tier = detectPerformanceTier()

    // Параметры по уровню железа
    const config = {
      low:  { countDiv: 28000, maxCount: 40,  maxDist: 0.18, shadowBlurBase: 0,  shadowBlurLine: 0,  glowRadius: 2, trailAlpha: 0.18, particleChance: 0,     skipFrames: 2 },
      mid:  { countDiv: 20000, maxCount: 65,  maxDist: 0.20, shadowBlurBase: 6,  shadowBlurLine: 5,  glowRadius: 3, trailAlpha: 0.15, particleChance: 0.001, skipFrames: 1 },
      high: { countDiv: 14000, maxCount: 100, maxDist: 0.22, shadowBlurBase: 14, shadowBlurLine: 10, glowRadius: 5, trailAlpha: 0.13, particleChance: 0.003, skipFrames: 0 },
    }[tier]

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight

    // На слабых — рендерим в половину разрешения
    const scale = tier === "low" ? 0.5 : tier === "mid" ? 0.75 : 1
    canvas.width = Math.floor(W * scale)
    canvas.height = Math.floor(H * scale)
    ctx.scale(scale, scale)

    const NEURON_COUNT = Math.min(Math.floor((W * H) / config.countDiv), config.maxCount)
    const MAX_DIST = Math.min(W, H) * config.maxDist
    const CENTER_PULL = 0.0010
    const DAMPING = 0.997
    const MOUSE_RADIUS = 110

    const neurons: Neuron[] = []
    for (let corner = 0; corner < 4; corner++) {
      const perCorner = Math.floor(NEURON_COUNT / 4)
      for (let i = 0; i < perCorner; i++) {
        neurons.push(initNeuron(W, H, corner))
      }
    }

    let frameId: number
    let t = 0
    let frameCount = 0

    function draw() {
      frameId = requestAnimationFrame(draw)
      frameCount++

      // Пропускаем кадры на слабом железе
      if (config.skipFrames > 0 && frameCount % (config.skipFrames + 1) !== 0) return

      t++
      const mouse = mouseRef.current

      // Fade trail
      ctx.fillStyle = `rgba(0,0,0,${config.trailAlpha})`
      ctx.fillRect(0, 0, W, H)

      // Update neurons
      for (const n of neurons) {
        const cdx = W / 2 - n.x
        const cdy = H / 2 - n.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
        const pull = CENTER_PULL * (1 + cdist / (Math.min(W, H) * 0.5))
        n.vx += cdx * pull
        n.vy += cdy * pull

        // Mouse interaction (только mid и high)
        if (mouse.active && tier !== "low") {
          const mdx = n.x - mouse.x
          const mdy = n.y - mouse.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)

          if (mdist < MOUSE_RADIUS && mdist > 1) {
            const repelStr = 0.008 * (1 - mdist / MOUSE_RADIUS)
            n.vx += (mdx / mdist) * repelStr * 60
            n.vy += (mdy / mdist) * repelStr * 60
          } else if (mdist < MOUSE_RADIUS * 2.5 && mdist > MOUSE_RADIUS) {
            const attractStr = 0.0015 * (1 - (mdist - MOUSE_RADIUS) / (MOUSE_RADIUS * 1.5))
            n.vx -= (mdx / mdist) * attractStr * 25
            n.vy -= (mdy / mdist) * attractStr * 25
          }
        }

        n.vx *= DAMPING
        n.vy *= DAMPING
        n.vx += (Math.random() - 0.5) * 0.03
        n.vy += (Math.random() - 0.5) * 0.03

        n.x += n.vx
        n.y += n.vy
        n.pulsePhase += n.pulseSpeed

        if (n.x < 15) { n.x = 15; n.vx = Math.abs(n.vx) * 0.5 }
        if (n.x > W - 15) { n.x = W - 15; n.vx = -Math.abs(n.vx) * 0.5 }
        if (n.y < 15) { n.y = 15; n.vy = Math.abs(n.vy) * 0.5 }
        if (n.y > H - 15) { n.y = H - 15; n.vy = -Math.abs(n.vy) * 0.5 }
      }

      // Draw connections
      ctx.shadowBlur = 0
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i], b = neurons[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MAX_DIST) continue

          const fade = 1 - d / MAX_DIST
          // Пульс только на high
          const pulse = tier === "high"
            ? 0.5 + 0.5 * Math.sin(t * 0.03 + a.pulsePhase)
            : 0.7
          const alpha = fade * fade * (0.3 + 0.2 * pulse)

          const isSame = a.color === b.color
          let r: number, g: number, bl: number
          if (isSame && a.color === "red") { r = 255; g = 30; bl = 50 }
          else if (isSame && a.color === "blue") { r = 0; g = 100; bl = 255 }
          else { r = 140; g = 60; bl = 255 }

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${r},${g},${bl},${Math.min(alpha, 1)})`
          ctx.lineWidth = fade * 1.5 + 0.3

          if (config.shadowBlurLine > 0) {
            ctx.shadowColor = isSame ? (a.color === "red" ? "#ff2244" : "#0066ff") : "#8844ff"
            ctx.shadowBlur = config.shadowBlurLine * fade * pulse
          }
          ctx.stroke()

          // Бегущие частицы — только high
          if (config.particleChance > 0 && Math.random() < config.particleChance) {
            ctx.shadowBlur = 0
            const pct = Math.sin(t * 0.05 + i * 0.3) * 0.5 + 0.5
            ctx.beginPath()
            ctx.arc(a.x + dx * pct, a.y + dy * pct, 1.2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r},${g},${bl},0.9)`
            ctx.fill()
          }
        }
      }

      ctx.shadowBlur = 0

      // Draw neurons
      for (const n of neurons) {
        const pulse = tier === "low"
          ? 0.8
          : 0.6 + 0.4 * Math.sin(n.pulsePhase)
        const r = n.radius * (0.9 + 0.2 * pulse)
        const isRed = n.color === "red"

        // Внешнее свечение — только mid и high
        if (config.glowRadius > 2) {
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * config.glowRadius)
          grd.addColorStop(0, isRed
            ? `rgba(255,30,50,${0.35 * pulse})`
            : `rgba(0,80,255,${0.35 * pulse})`)
          grd.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * config.glowRadius, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        // Ядро
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = isRed ? "#ff2244" : "#0066ff"
        if (config.shadowBlurBase > 0) {
          ctx.shadowColor = isRed ? "#ff0033" : "#0055ff"
          ctx.shadowBlur = config.shadowBlurBase * pulse
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Аура курсора — только high
      if (tier === "high" && mouse.active) {
        const mgrd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS)
        mgrd.addColorStop(0, "rgba(180,100,255,0.06)")
        mgrd.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = mgrd
        ctx.fill()
      }
    }

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, W, H)
    frameId = requestAnimationFrame(draw)

    // Mouse / touch
    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale }
    }
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { ...toCanvasCoords(e.clientX, e.clientY), active: true }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999, active: false } }
    const onTouchMove = (e: TouchEvent) => {
      mouseRef.current = { ...toCanvasCoords(e.touches[0].clientX, e.touches[0].clientY), active: true }
    }
    const onTouchEnd = () => { mouseRef.current = { x: -9999, y: -9999, active: false } }

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)
    canvas.addEventListener("touchmove", onTouchMove, { passive: true })
    canvas.addEventListener("touchend", onTouchEnd)

    const onResize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = Math.floor(W * scale)
      canvas.height = Math.floor(H * scale)
      ctx.scale(scale, scale)
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, W, H)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block", imageRendering: "auto" }}
    />
  )
}
