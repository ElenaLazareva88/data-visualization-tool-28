import { Canvas, extend, useFrame } from "@react-three/fiber"
import { useAspect } from "@react-three/drei"
import { useMemo, useRef, useState, useEffect, Component, type ReactNode } from "react"
import * as THREE from "three"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"

class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}

const TEXTUREMAP_URL = "https://cdn.poehali.dev/projects/0741ffef-3765-4e8a-b89c-639ee3dc6ac6/bucket/hero/texture.png"
const DEPTHMAP_URL = "https://cdn.poehali.dev/projects/0741ffef-3765-4e8a-b89c-639ee3dc6ac6/bucket/hero/depthmap.webp"

extend(THREE as unknown as Record<string, unknown>)

const WIDTH = 300
const HEIGHT = 300

function loadTextureFromUrl(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const tex = new THREE.Texture(img)
      tex.needsUpdate = true
      resolve(tex)
    }
    img.onerror = reject
    img.src = url
  })
}

const Scene = ({ textures }: { textures: [THREE.Texture, THREE.Texture] }) => {
  const [rawMap, depthMap] = textures
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform sampler2D uDepthMap;
      uniform vec2 uPointer;
      uniform float uProgress;
      uniform float uTime;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = vUv;

        float depth = texture2D(uDepthMap, uv).r;
        vec2 displacement = depth * uPointer * 0.01;
        vec2 distortedUv = uv + displacement;

        vec4 baseColor = texture2D(uTexture, distortedUv);

        float aspect = ${WIDTH}.0 / ${HEIGHT}.0;
        vec2 tUv = vec2(uv.x * aspect, uv.y);
        vec2 tiling = vec2(120.0);
        vec2 tiledUv = mod(tUv * tiling, 2.0) - 1.0;

        float brightness = noise(tUv * tiling * 0.5);
        float dist = length(tiledUv);
        float dot = smoothstep(0.5, 0.49, dist) * brightness;

        float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));

        vec3 mask = vec3(dot * flow * 5.0, 0.0, dot * flow * 8.0);

        vec3 final = baseColor.rgb + mask;

        gl_FragColor = vec4(final, 1.0);
      }
    `

    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: rawMap },
        uDepthMap: { value: depthMap },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    })
  }, [rawMap, depthMap])

  const [w, h] = useAspect(WIDTH, HEIGHT)

  useFrame(({ clock, pointer }) => {
    if (material.uniforms) {
      material.uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5
      material.uniforms.uPointer.value = pointer
      material.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  const scaleFactor = 0.3
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  )
}

const CanvasWithTextures = () => {
  const [textures, setTextures] = useState<[THREE.Texture, THREE.Texture] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([loadTextureFromUrl(TEXTUREMAP_URL), loadTextureFromUrl(DEPTHMAP_URL)])
      .then(([t1, t2]) => setTextures([t1, t2]))
      .catch(() => setError(true))
  }, [])

  if (error) return <div className="absolute inset-0" style={{ background: "hsl(230 15% 7%)" }} />
  if (!textures) return null

  return (
    <Canvas
      flat
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1] }}
      style={{ background: "hsl(230,15%,7%)", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <Scene textures={textures} />
    </Canvas>
  )
}

const stats = [
  { value: "50K+", label: "Пользователей" },
  { value: "1M+", label: "Генераций" },
  { value: "5", label: "Типов контента" },
]

export const Hero3DWebGL = () => {
  const titleWords = ["ИИ", "Кира"]
  const subtitle = "Привет-привет! Я Кира. Рада видеть тебя здесь — самое время для крутых идей!"
  const [visibleWords, setVisibleWords] = useState(0)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [delays] = useState(() => titleWords.map(() => Math.random() * 0.07))

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 500)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 700)
      return () => clearTimeout(timeout)
    }
  }, [visibleWords, titleWords.length])

  return (
    <div className="h-screen relative overflow-hidden" style={{ background: "hsl(230 15% 7%)" }}>
      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[hsl(230_15%_7%)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[hsl(230_15%_7%)] to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[hsl(230_15%_7%)] to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[hsl(230_15%_7%)] to-transparent" />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
        <div className="orb orb-violet animate-orb1 w-96 h-96 -top-20 -left-20" style={{ opacity: 0.12 }} />
        <div className="orb orb-cyan animate-orb2 w-80 h-80 -bottom-10 -right-10" style={{ opacity: 0.1 }} />
      </div>

      {/* Hero content */}
      <div className="h-screen items-center w-full absolute z-[60] pointer-events-none px-6 md:px-10 flex justify-center flex-col">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 pointer-events-auto"
        >
          <span className="glass px-4 py-1.5 rounded-full text-xs font-medium text-violet-300 border border-violet-500/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            ИИ-платформа нового поколения
          </span>
        </motion.div>

        {/* Title */}
        <div className="text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold font-orbitron uppercase">
          <div className="flex space-x-4 lg:space-x-6 overflow-hidden">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={`${index < visibleWords ? "fade-in" : ""} ${index === 1 ? "gradient-text" : "text-white"}`}
                style={{
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                  opacity: index < visibleWords ? undefined : 0,
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-sm md:text-lg xl:text-xl mt-4 overflow-hidden text-white/60 max-w-2xl mx-auto text-center px-4 font-light">
          <div
            className={subtitleVisible ? "fade-in-subtitle" : ""}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2}s`,
              opacity: subtitleVisible ? undefined : 0,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* CTA */}
        {subtitleVisible && (
          <motion.div
            className="flex flex-wrap gap-3 justify-center mt-8 pointer-events-auto normal-case"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            <Link
              to="/create"
              className="group px-7 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)",
              }}
            >
              Начать создавать
              <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="px-7 py-3 rounded-xl font-semibold text-sm md:text-base text-white/80 hover:text-white transition-all duration-300 glass border border-white/10 hover:border-violet-500/40"
            >
              Тарифы
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        {subtitleVisible && (
          <motion.div
            className="flex flex-wrap gap-8 justify-center mt-12 pointer-events-none normal-case"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {stats.map((s, i) => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl md:text-3xl font-bold font-orbitron ${i === 0 ? "gradient-text" : i === 1 ? "text-cyan-400" : "text-violet-400"}`}>
                  {s.value}
                </div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Scroll hint */}
        {subtitleVisible && (
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="flex flex-col items-center gap-2 text-white/30">
              <span className="text-xs">Прокрути вниз</span>
              <Icon name="ChevronDown" size={16} className="animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <CanvasErrorBoundary fallback={<div className="absolute inset-0" style={{ background: "hsl(230 15% 7%)" }} />}>
          <CanvasWithTextures />
        </CanvasErrorBoundary>
      </div>
    </div>
  )
}

export default Hero3DWebGL
