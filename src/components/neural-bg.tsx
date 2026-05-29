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
  originX: number
  originY: number
  scatterVx: number
  scatterVy: number
  arriveProgress: number
  arriveSpeed: number
}

function detectTier(): "low" | "mid" | "high" {
  const cores = navigator.hardwareConcurrency || 2
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 2
  const mobile = /Mobi|Android/i.test(navigator.userAgent)
  if (mobile || cores <= 2 || mem <= 2) return "low"
  if (cores <= 4 || mem <= 4) return "mid"
  return "high"
}

function randomEdgePoint(W: number, H: number): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4)
  switch (side) {
    case 0: return { x: Math.random() * W, y: -40 }
    case 1: return { x: W + 40, y: Math.random() * H }
    case 2: return { x: Math.random() * W, y: H + 40 }
    default: return { x: -40, y: Math.random() * H }
  }
}

function makeNeuron(W: number, H: number, cx: number, cy: number): Neuron {
  const origin = randomEdgePoint(W, H)
  const angle = Math.atan2(origin.y - cy, origin.x - cx) + (Math.random() - 0.5) * 0.9
  const speed = 1.5 + Math.random() * 2.5
  return {
    x: origin.x,
    y: origin.y,
    vx: 0,
    vy: 0,
    radius: 1.5 + Math.random() * 2.2,
    color: Math.random() < 0.5 ? "red" : "blue",
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.022 + Math.random() * 0.03,
    originX: origin.x,
    originY: origin.y,
    scatterVx: Math.cos(angle) * speed,
    scatterVy: Math.sin(angle) * speed,
    arriveProgress: 0,
    arriveSpeed: 0.003 + Math.random() * 0.005,
  }
}

type Phase = "arriving" | "gathering" | "scattering" | "resetting"

export function NeuralBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const tier = detectTier()

    const cfg = {
      low:  { count: 50,  maxDist: 0.20, shadow: 0,  glowR: 2, trail: 0.15, skip: 2, scale: 0.5  },
      mid:  { count: 85,  maxDist: 0.21, shadow: 6,  glowR: 3, trail: 0.13, skip: 1, scale: 0.75 },
      high: { count: 140, maxDist: 0.23, shadow: 13, glowR: 5, trail: 0.11, skip: 0, scale: 1    },
    }[tier]

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    const sc = cfg.scale
    canvas.width = Math.floor(W * sc)
    canvas.height = Math.floor(H * sc)
    ctx.scale(sc, sc)

    let cx = W / 2
    let cy = H / 2

    const MAX_DIST = Math.min(W, H) * cfg.maxDist
    const MOUSE_R = 110

    const neurons: Neuron[] = Array.from({ length: cfg.count }, () => makeNeuron(W, H, cx, cy))

    // Фазовые тайминги (мс)
    const PHASE_DUR: Record<Phase, number> = {
      arriving:   5500,
      gathering:  2200,
      scattering: 2000,
      resetting:  100,
    }

    let phase: Phase = "arriving"
    let phaseStart = performance.now()

    function nextPhase(now: number) {
      if (phase === "arriving")    phase = "gathering"
      else if (phase === "gathering")  phase = "scattering"
      else if (phase === "scattering") phase = "resetting"
      else {
        phase = "arriving"
        for (const n of neurons) {
          const o = randomEdgePoint(W, H)
          n.originX = o.x; n.originY = o.y
          n.x = o.x; n.y = o.y
          n.vx = 0; n.vy = 0
          n.arriveProgress = 0
          const angle = Math.atan2(o.y - cy, o.x - cx) + (Math.random() - 0.5) * 0.9
          const speed = 1.5 + Math.random() * 2.5
          n.scatterVx = Math.cos(angle) * speed
          n.scatterVy = Math.sin(angle) * speed
        }
      }
      phaseStart = now
    }

    let frameId: number
    let frameCount = 0
    let t = 0

    function draw(now: number) {
      frameId = requestAnimationFrame(draw)
      frameCount++
      if (cfg.skip > 0 && frameCount % (cfg.skip + 1) !== 0) return
      t++

      if (now - phaseStart > PHASE_DUR[phase]) nextPhase(now)
      const phaseT = Math.min((now - phaseStart) / PHASE_DUR[phase], 1)
      const mouse = mouseRef.current

      ctx.fillStyle = `rgba(0,0,0,${cfg.trail})`
      ctx.fillRect(0, 0, W, H)

      // --- Обновление позиций ---
      for (const n of neurons) {
        n.pulsePhase += n.pulseSpeed

        if (phase === "arriving" || phase === "resetting") {
          n.arriveProgress = Math.min(n.arriveProgress + n.arriveSpeed, 1)
          // easeInOutCubic
          const p = n.arriveProgress
          const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
          // Волнистый путь к центру
          const wobble = Math.sin(t * 0.05 + n.pulsePhase) * 18 * (1 - ease)
          const lenOC = Math.sqrt((n.originX - cx) ** 2 + (n.originY - cy) ** 2) || 1
          const perpX = -(n.originY - cy) / lenOC
          const perpY =  (n.originX - cx) / lenOC
          n.x = n.originX + (cx - n.originX) * ease + perpX * wobble
          n.y = n.originY + (cy - n.originY) * ease + perpY * wobble

        } else if (phase === "gathering") {
          // Пульсирующее кружение у центра
          const orbitR = 15 + Math.sin(n.pulsePhase * 0.7) * 20
          const speed = 0.012 + Math.sin(n.pulsePhase * 0.3) * 0.005
          const orbitAngle = n.pulsePhase * 0.25 + t * speed
          const tx = cx + Math.cos(orbitAngle) * orbitR
          const ty = cy + Math.sin(orbitAngle) * orbitR
          n.x += (tx - n.x) * 0.05
          n.y += (ty - n.y) * 0.05

          if (mouse.active && tier !== "low") {
            const mdx = n.x - mouse.x, mdy = n.y - mouse.y
            const md = Math.sqrt(mdx * mdx + mdy * mdy)
            if (md < MOUSE_R && md > 1) {
              n.x += (mdx / md) * (MOUSE_R - md) * 0.06
              n.y += (mdy / md) * (MOUSE_R - md) * 0.06
            }
          }

        } else if (phase === "scattering") {
          const accel = 1 + phaseT * 4
          n.x += n.scatterVx * accel
          n.y += n.scatterVy * accel
          n.scatterVx += (Math.random() - 0.5) * 0.12
          n.scatterVy += (Math.random() - 0.5) * 0.12
        }
      }

      // Усиление свечения в фазе gathering
      const glowMult = phase === "gathering"
        ? 1.6 + Math.sin(t * 0.06) * 0.6
        : phase === "scattering"
          ? Math.max(1 - phaseT * 0.7, 0.4)
          : 1

      // --- Связи ---
      ctx.shadowBlur = 0
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i], b = neurons[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MAX_DIST) continue

          const fade = 1 - d / MAX_DIST
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.03 + a.pulsePhase)
          const alpha = Math.min(fade * fade * (0.32 + 0.22 * pulse) * glowMult, 1)

          const isSame = a.color === b.color
          let rc: number, gc: number, bc: number
          if (isSame && a.color === "red")       { rc = 255; gc = 25;  bc = 45  }
          else if (isSame && a.color === "blue") { rc = 0;   gc = 100; bc = 255 }
          else                                    { rc = 180; gc = 50;  bc = 255 }

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${rc},${gc},${bc},${alpha})`
          ctx.lineWidth = (fade * 1.7 + 0.3) * Math.min(glowMult, 2)

          if (cfg.shadow > 0) {
            ctx.shadowColor = isSame ? (a.color === "red" ? "#ff2244" : "#0055ff") : "#9922ff"
            ctx.shadowBlur = cfg.shadow * fade * pulse * Math.min(glowMult, 2.5)
          }
          ctx.stroke()
        }
      }
      ctx.shadowBlur = 0

      // --- Нейроны ---
      for (const n of neurons) {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulsePhase)
        const sizeBoost = phase === "gathering" ? 1.35 : 1
        const r = n.radius * (0.9 + 0.2 * pulse) * sizeBoost
        const isRed = n.color === "red"

        if (cfg.glowR > 2) {
          const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * cfg.glowR * Math.min(glowMult, 2))
          gr.addColorStop(0, isRed
            ? `rgba(255,30,50,${Math.min(0.45 * pulse * glowMult, 1)})`
            : `rgba(0,80,255,${Math.min(0.45 * pulse * glowMult, 1)})`)
          gr.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * cfg.glowR * Math.min(glowMult, 2), 0, Math.PI * 2)
          ctx.fillStyle = gr
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = isRed ? "#ff2244" : "#2266ff"
        if (cfg.shadow > 0) {
          ctx.shadowColor = isRed ? "#ff0033" : "#0055ff"
          ctx.shadowBlur = cfg.shadow * pulse * Math.min(glowMult, 2.5)
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Аура курсора
      if (tier === "high" && mouse.active) {
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_R)
        mg.addColorStop(0, "rgba(180,100,255,0.06)")
        mg.addColorStop(1, "rgba(0,0,0,0)")
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, MOUSE_R, 0, Math.PI * 2)
        ctx.fillStyle = mg
        ctx.fill()
      }
    }

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, W, H)
    frameId = requestAnimationFrame(draw)

    const toC = (cx2: number, cy2: number) => {
      const rect = canvas.getBoundingClientRect()
      return { x: (cx2 - rect.left) / sc, y: (cy2 - rect.top) / sc }
    }
    const onMove  = (e: MouseEvent)  => { mouseRef.current = { ...toC(e.clientX, e.clientY), active: true } }
    const onLeave = ()               => { mouseRef.current = { x: -9999, y: -9999, active: false } }
    const onTouch = (e: TouchEvent)  => { mouseRef.current = { ...toC(e.touches[0].clientX, e.touches[0].clientY), active: true } }
    const onTEnd  = ()               => { mouseRef.current = { x: -9999, y: -9999, active: false } }

    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("mouseleave", onLeave)
    canvas.addEventListener("touchmove", onTouch, { passive: true })
    canvas.addEventListener("touchend", onTEnd)

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      cx = W / 2; cy = H / 2
      canvas.width = Math.floor(W * sc); canvas.height = Math.floor(H * sc)
      ctx.scale(sc, sc)
      ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, W, H)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("mouseleave", onLeave)
      canvas.removeEventListener("touchmove", onTouch)
      canvas.removeEventListener("touchend", onTEnd)
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
