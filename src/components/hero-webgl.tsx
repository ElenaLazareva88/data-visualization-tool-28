import { Canvas, extend, useFrame } from "@react-three/fiber"
import { useAspect } from "@react-three/drei"
import { useMemo, useRef, useState, useEffect, Component, type ReactNode } from "react"
import * as THREE from "three"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

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

        vec3 mask = vec3(dot * flow * 10.0, 0.0, 0.0);

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

  if (error) return <div className="absolute inset-0 bg-black" />
  if (!textures) return null

  return (
    <Canvas
      flat
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1] }}
      style={{ background: "#000000", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <Scene textures={textures} />
    </Canvas>
  )
}

export const Hero3DWebGL = () => {
  const titleWords = "AI Studio".split(" ")
  const subtitle = "Раскрой свой творческий потенциал с AI Studio!"
  const [visibleWords, setVisibleWords] = useState(0)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [delays, setDelays] = useState<number[]>([])
  const [subtitleDelay, setSubtitleDelay] = useState(0)

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07))
    setSubtitleDelay(Math.random() * 0.1)
  }, [titleWords.length])

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800)
      return () => clearTimeout(timeout)
    }
  }, [visibleWords, titleWords.length])

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />
      </div>

      <div className="h-screen uppercase items-center w-full absolute z-[60] pointer-events-none px-10 flex justify-center flex-col">
        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold font-orbitron">
          <div className="flex space-x-2 lg:space-x-6 overflow-hidden text-white">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? "fade-in" : ""}
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
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold max-w-4xl mx-auto text-center px-4">
          <div
            className={subtitleVisible ? "fade-in-subtitle" : ""}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? undefined : 0,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* CTA кнопки */}
        {subtitleVisible && (
          <motion.div
            className="flex flex-wrap gap-4 justify-center mt-8 pointer-events-auto normal-case"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            <Link
              to="/music"
              className="px-7 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 text-sm md:text-base"
            >
              Начать создавать
            </Link>
            <a
              href="#technology"
              className="px-7 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-105 text-sm md:text-base"
            >
              Узнать больше
            </a>
          </motion.div>
        )}

        {/* Статистика */}
        {subtitleVisible && (
          <motion.div
            className="flex flex-wrap gap-8 justify-center mt-12 pointer-events-none normal-case"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {[
              { value: "50K+", label: "Пользователей" },
              { value: "1M+", label: "Генераций" },
              { value: "5", label: "Типов контента" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white font-orbitron">{s.value}</div>
                <div className="text-gray-400 text-xs md:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="absolute inset-0">
        <CanvasErrorBoundary fallback={<div className="absolute inset-0 bg-black" />}>
          <CanvasWithTextures />
        </CanvasErrorBoundary>
      </div>
    </div>
  )
}

export default Hero3DWebGL