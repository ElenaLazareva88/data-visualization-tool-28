import { useEffect, useRef } from "react"

interface Neuron {
  x: number
  y: number
  radius: number
  color: "red" | "blue"
  pulsePhase: number
  pulseSpeed: number
  // Стартовая точка (край экрана)
  originX: number
  originY: number
  // Целевая точка внутри формы мозга
  targetX: number
  targetY: number
  // Вектор разлёта
  scatterVx: number
  scatterVy: number
  // Прогресс прилёта [0..1]
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

function randomEdgePoint(W: number, H: number) {
  const side = Math.floor(Math.random() * 4)
  switch (side) {
    case 0: return { x: Math.random() * W, y: -50 }
    case 1: return { x: W + 50, y: Math.random() * H }
    case 2: return { x: Math.random() * W, y: H + 50 }
    default: return { x: -50, y: Math.random() * H }
  }
}

// Генерирует точку внутри силуэта мозга методом rejection sampling
// Мозг задаётся как два перекрывающихся эллипса с бугорчатым контуром
function randomBrainPoint(cx: number, cy: number, bw: number, bh: number): { x: number; y: number } {
  for (let attempt = 0; attempt < 60; attempt++) {
    const side = Math.random() < 0.52 ? -1 : 1        // левое/правое полушарие
    const hx = cx + side * bw * 0.22                   // смещение центра полушария
    const rx = bw * (0.38 + Math.random() * 0.1)
    const ry = bh * (0.42 + Math.random() * 0.08)
    const angle = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random())                 // равномерно по площади
    const px = hx + Math.cos(angle) * rx * r
    const py = cy + Math.sin(angle) * ry * r

    // Добавляем бугорки (извилины) — небольшое радиальное смещение по синусу
    const relX = (px - cx) / (bw * 0.5)
    const relY = (py - cy) / (bh * 0.5)
    const distC = Math.sqrt(relX * relX + relY * relY)
    if (distC < 1.05) return { x: px, y: py }
  }
  // fallback — просто эллипс
  const a = Math.random() * Math.PI * 2
  return { x: cx + Math.cos(a) * bw * 0.35, y: cy + Math.sin(a) * bh * 0.38 }
}

function makeNeuron(W: number, H: number, cx: number, cy: number, bw: number, bh: number): Neuron {
  const origin = randomEdgePoint(W, H)
  const target = randomBrainPoint(cx, cy, bw, bh)
  const angle = Math.atan2(origin.y - cy, origin.x - cx) + (Math.random() - 0.5) * 1.1
  const speed = 1.8 + Math.random() * 3
  return {
    x: origin.x,
    y: origin.y,
    radius: 1.4 + Math.random() * 2,
    color: Math.random() < 0.5 ? "red" : "blue",
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
    originX: origin.x,
    originY: origin.y,
    targetX: target.x,
    targetY: target.y,
    scatterVx: Math.cos(angle) * speed,
    scatterVy: Math.sin(angle) * speed,
    arriveProgress: 0,
    arriveSpeed: 0.0025 + Math.random() * 0.004,
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
      low:  { count: 55,  maxDist: 0.19, shadow: 0,  glowR: 2, trail: 0.15, skip: 2, scale: 0.5  },
      mid:  { count: 90,  maxDist: 0.21, shadow: 6,  glowR: 3, trail: 0.13, skip: 1, scale: 0.75 },
      high: { count: 150, maxDist: 0.23, shadow: 13, glowR: 5, trail: 0.11, skip: 0, scale: 1    },
    }[tier]

    let W = canvas.offsetWidth
    let H = canvas.offsetHeight
    const sc = cfg.scale
    canvas.width = Math.floor(W * sc)
    canvas.height = Math.floor(H * sc)
    ctx.scale(sc, sc)

    let cx = W / 2
    let cy = H / 2

    // Размер «мозга» — занимает ~40% ширины и ~35% высоты экрана
    let bw = W * 0.40
    let bh = H * 0.35

    const MAX_DIST = Math.min(W, H) * cfg.maxDist
    const MOUSE_R = 115

    const neurons: Neuron[] = Array.from({ length: cfg.count }, () =>
      makeNeuron(W, H, cx, cy, bw, bh)
    )

    const PHASE_DUR: Record<Phase, number> = {
      arriving:   5500,
      gathering:  2800,
      scattering: 2200,
      resetting:  120,
    }

    let phase: Phase = "arriving"
    let phaseStart = performance.now()

    function nextPhase(now: number) {
      if (phase === "arriving") {
        phase = "gathering"
      } else if (phase === "gathering") {
        phase = "scattering"
        // Пересчитываем угол разлёта от текущей позиции
        for (const n of neurons) {
          const angle = Math.atan2(n.y - cy, n.x - cx) + (Math.random() - 0.5) * 1.2
          const speed = 1.8 + Math.random() * 3.5
          n.scatterVx = Math.cos(angle) * speed
          n.scatterVy = Math.sin(angle) * speed
        }
      } else if (phase === "scattering") {
        phase = "resetting"
      } else {
        phase = "arriving"
        for (const n of neurons) {
          const o = randomEdgePoint(W, H)
          const target = randomBrainPoint(cx, cy, bw, bh)
          n.originX = o.x; n.originY = o.y
          n.x = o.x; n.y = o.y
          n.targetX = target.x; n.targetY = target.y
          n.arriveProgress = 0
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

      // ── Обновление позиций ──────────────────────────────────────────────
      for (const n of neurons) {
        n.pulsePhase += n.pulseSpeed

        if (phase === "arriving" || phase === "resetting") {
          n.arriveProgress = Math.min(n.arriveProgress + n.arriveSpeed, 1)
          const p = n.arriveProgress
          // easeInOutCubic
          const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
          // Волнистый путь
          const wobble = Math.sin(t * 0.05 + n.pulsePhase) * 22 * (1 - ease)
          const lenOT = Math.sqrt((n.originX - n.targetX) ** 2 + (n.originY - n.targetY) ** 2) || 1
          const perpX = -(n.originY - n.targetY) / lenOT
          const perpY =  (n.originX - n.targetX) / lenOT
          n.x = n.originX + (n.targetX - n.originX) * ease + perpX * wobble
          n.y = n.originY + (n.targetY - n.originY) * ease + perpY * wobble

        } else if (phase === "gathering") {
          // Нейроны слегка пульсируют внутри формы мозга
          // Лёгкое колыхание вокруг своей target точки
          const wobble = 8 + Math.sin(n.pulsePhase * 0.6) * 5
          const wAngle = n.pulsePhase * 0.18 + t * 0.008
          const tx = n.targetX + Math.cos(wAngle) * wobble
          const ty = n.targetY + Math.sin(wAngle) * wobble
          n.x += (tx - n.x) * 0.06
          n.y += (ty - n.y) * 0.06

          // Мышь отталкивает
          if (mouse.active && tier !== "low") {
            const mdx = n.x - mouse.x, mdy = n.y - mouse.y
            const md = Math.sqrt(mdx * mdx + mdy * mdy)
            if (md < MOUSE_R && md > 1) {
              n.x += (mdx / md) * (MOUSE_R - md) * 0.07
              n.y += (mdy / md) * (MOUSE_R - md) * 0.07
            }
          }

        } else if (phase === "scattering") {
          const accel = 1 + phaseT * 4.5
          n.x += n.scatterVx * accel
          n.y += n.scatterVy * accel
          n.scatterVx += (Math.random() - 0.5) * 0.15
          n.scatterVy += (Math.random() - 0.5) * 0.15
        }
      }

      // Интенсивность свечения
      const glowMult =
        phase === "gathering"
          ? 1.7 + Math.sin(t * 0.055) * 0.65   // пульсирует максимально
          : phase === "arriving"
          ? 0.7 + phaseT * 0.5                  // нарастает по мере прилёта
          : phase === "scattering"
          ? Math.max(1.4 - phaseT * 1.2, 0.3)   // угасает при разлёте
          : 1

      // ── Связи ──────────────────────────────────────────────────────────
      ctx.shadowBlur = 0
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i], b = neurons[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > MAX_DIST) continue

          const fade = 1 - d / MAX_DIST
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.03 + a.pulsePhase)
          const alpha = Math.min(fade * fade * (0.3 + 0.22 * pulse) * glowMult, 1)

          const isSame = a.color === b.color
          let rc: number, gc: number, bc: number
          if      (isSame && a.color === "red")  { rc = 255; gc = 25;  bc = 50  }
          else if (isSame && a.color === "blue") { rc = 0;   gc = 110; bc = 255 }
          else                                    { rc = 180; gc = 50;  bc = 255 }

          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${rc},${gc},${bc},${alpha})`
          ctx.lineWidth = (fade * 1.8 + 0.3) * Math.min(glowMult, 2.2)

          if (cfg.shadow > 0) {
            ctx.shadowColor = isSame ? (a.color === "red" ? "#ff2244" : "#0055ff") : "#9922ff"
            ctx.shadowBlur = cfg.shadow * fade * pulse * Math.min(glowMult, 2.5)
          }
          ctx.stroke()
        }
      }
      ctx.shadowBlur = 0

      // ── Нейроны ────────────────────────────────────────────────────────
      for (const n of neurons) {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulsePhase)
        const sizeBoost = phase === "gathering" ? 1.3 : 1
        const r = n.radius * (0.88 + 0.24 * pulse) * sizeBoost
        const isRed = n.color === "red"

        if (cfg.glowR > 2) {
          const glowSize = r * cfg.glowR * Math.min(glowMult, 2.2)
          const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowSize)
          gr.addColorStop(0, isRed
            ? `rgba(255,30,50,${Math.min(0.45 * pulse * glowMult, 1)})`
            : `rgba(0,90,255,${Math.min(0.45 * pulse * glowMult, 1)})`)
          gr.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(n.x, n.y, glowSize, 0, Math.PI * 2)
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

      // Аура курсора (только high)
      if (tier === "high" && mouse.active) {
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_R)
        mg.addColorStop(0, "rgba(180,100,255,0.07)")
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

    // ── События ────────────────────────────────────────────────────────
    const toC = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return { x: (clientX - rect.left) / sc, y: (clientY - rect.top) / sc }
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
      bw = W * 0.40; bh = H * 0.35
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
