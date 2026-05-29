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

interface Connection {
  a: number
  b: number
  opacity: number
  flowOffset: number
}

const RED_COLORS = ["#ff2244", "#ff0033", "#ff3355", "#cc0022", "#ff1144"]
const BLUE_COLORS = ["#0066ff", "#0044ee", "#2255ff", "#0033cc", "#1155ff"]

function initNeuron(W: number, H: number, corner: number, i: number, total: number): Neuron {
  const margin = 80
  const spread = 0.35

  let startX = 0, startY = 0
  let vxBase = 0, vyBase = 0

  switch (corner) {
    case 0: startX = Math.random() * W * spread; startY = Math.random() * H * spread; vxBase = 0.4; vyBase = 0.4; break
    case 1: startX = W - Math.random() * W * spread; startY = Math.random() * H * spread; vxBase = -0.4; vyBase = 0.4; break
    case 2: startX = Math.random() * W * spread; startY = H - Math.random() * H * spread; vxBase = 0.4; vyBase = -0.4; break
    case 3: startX = W - Math.random() * W * spread; startY = H - Math.random() * H * spread; vxBase = -0.4; vyBase = -0.4; break
  }

  const angle = (Math.random() - 0.5) * Math.PI * 0.6
  const speed = 0.25 + Math.random() * 0.35
  const cos = Math.cos(angle), sin = Math.sin(angle)

  return {
    x: startX,
    y: startY,
    vx: (vxBase * cos - vyBase * sin) * speed,
    vy: (vxBase * sin + vyBase * cos) * speed,
    radius: 2 + Math.random() * 2.5,
    color: corner === 0 || corner === 3 ? "red" : "blue",
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.03 + Math.random() * 0.04,
    originCorner: corner,
  }
}

export function NeuralBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const NEURON_COUNT = Math.min(Math.floor((W * H) / 14000), 110)
    const MAX_DIST = Math.min(W, H) * 0.22
    const CENTER_PULL = 0.0012
    const DAMPING = 0.998

    const neurons: Neuron[] = []
    for (let corner = 0; corner < 4; corner++) {
      const perCorner = Math.floor(NEURON_COUNT / 4)
      for (let i = 0; i < perCorner; i++) {
        neurons.push(initNeuron(W, H, corner, i, perCorner))
      }
    }

    let frameId: number
    let t = 0

    function draw() {
      t++

      // Fade trail
      ctx.fillStyle = "rgba(0,0,0,0.13)"
      ctx.fillRect(0, 0, W, H)

      // Update neurons
      for (const n of neurons) {
        // Pull toward center
        const dx = W / 2 - n.x
        const dy = H / 2 - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const pull = CENTER_PULL * (1 + dist / (Math.min(W, H) * 0.5))

        n.vx += dx * pull
        n.vy += dy * pull
        n.vx *= DAMPING
        n.vy *= DAMPING

        // Slight random drift
        n.vx += (Math.random() - 0.5) * 0.04
        n.vy += (Math.random() - 0.5) * 0.04

        n.x += n.vx
        n.y += n.vy
        n.pulsePhase += n.pulseSpeed

        // Soft bounce at edges
        if (n.x < 20) { n.x = 20; n.vx = Math.abs(n.vx) * 0.6 }
        if (n.x > W - 20) { n.x = W - 20; n.vx = -Math.abs(n.vx) * 0.6 }
        if (n.y < 20) { n.y = 20; n.vy = Math.abs(n.vy) * 0.6 }
        if (n.y > H - 20) { n.y = H - 20; n.vy = -Math.abs(n.vy) * 0.6 }
      }

      // Draw connections
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i], b = neurons[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MAX_DIST) continue

          const fade = 1 - d / MAX_DIST
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.03 + a.pulsePhase)
          const alpha = fade * fade * (0.35 + 0.25 * pulse)

          const isSame = a.color === b.color
          let lineColor: string

          if (isSame && a.color === "red") {
            lineColor = `rgba(255,30,50,${alpha})`
          } else if (isSame && a.color === "blue") {
            lineColor = `rgba(0,100,255,${alpha})`
          } else {
            // Mixed — purple glow
            lineColor = `rgba(140,60,255,${alpha * 0.9})`
          }

          // Glow line
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = lineColor
          ctx.lineWidth = fade * 1.8 + 0.4
          ctx.shadowColor = isSame ? (a.color === "red" ? "#ff2244" : "#0066ff") : "#8844ff"
          ctx.shadowBlur = 8 + 10 * fade * pulse
          ctx.stroke()

          // Flowing particle along connection
          if (Math.random() < 0.003) {
            const pct = (Math.sin(t * 0.05 + i * 0.3) * 0.5 + 0.5)
            const px = a.x + dx * pct
            const py = a.y + dy * pct
            ctx.beginPath()
            ctx.arc(px, py, 1.2, 0, Math.PI * 2)
            ctx.fillStyle = lineColor.replace(/[\d.]+\)$/, "0.9)")
            ctx.shadowBlur = 12
            ctx.fill()
          }
        }
      }

      ctx.shadowBlur = 0

      // Draw neurons
      for (const n of neurons) {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulsePhase)
        const r = n.radius * (0.85 + 0.3 * pulse)
        const baseColor = n.color === "red" ? RED_COLORS[0] : BLUE_COLORS[0]
        const glowColor = n.color === "red" ? "#ff0033" : "#0055ff"

        // Outer glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
        grd.addColorStop(0, n.color === "red" ? `rgba(255,30,50,${0.4 * pulse})` : `rgba(0,80,255,${0.4 * pulse})`)
        grd.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = baseColor
        ctx.shadowColor = glowColor
        ctx.shadowBlur = 18 * pulse
        ctx.fill()
        ctx.shadowBlur = 0
      }

      frameId = requestAnimationFrame(draw)
    }

    // Clear to black first
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, W, H)

    draw()

    const onResize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, W, H)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  )
}
