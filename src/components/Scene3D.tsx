import { useRef, useMemo, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ErrorBoundary to prevent 3D crashes from killing the whole app
class Scene3DErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

interface Props {
  mode: 'idle' | 'tangping' | 'broke'
  progress?: number
}

function Coins({ count = 30, scattered = false }: { count?: number; scattered?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: scattered ? -2 + Math.random() * 0.5 : Math.random() * 6 - 1,
      z: (Math.random() - 0.5) * 4,
      rotSpeed: (Math.random() - 0.5) * 2,
      fallSpeed: 0.005 + Math.random() * 0.01,
    }))
  }, [count, scattered])

  useFrame(() => {
    if (!meshRef.current) return
    positions.forEach((p, i) => {
      if (!scattered) {
        p.y -= p.fallSpeed
        if (p.y < -3) p.y = 5
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.x += p.rotSpeed * 0.01
      dummy.rotation.y += p.rotSpeed * 0.015
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
      <meshStandardMaterial color="#ffd93d" metalness={0.8} roughness={0.2} />
    </instancedMesh>
  )
}

function Person({ lying = false }: { lying?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const targetRotation = lying ? -Math.PI / 2 : 0
  const targetY = lying ? -0.5 : 0

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.z +=
      (targetRotation - groupRef.current.rotation.z) * 0.05
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.05
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffb385" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.2, 0.7, 8, 16]} />
        <meshStandardMaterial color="#6c63ff" />
      </mesh>
      <mesh position={[-0.12, -0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2d2d3d" />
      </mesh>
      <mesh position={[0.12, -0.1, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2d2d3d" />
      </mesh>
    </group>
  )
}

function Bed() {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh>
        <boxGeometry args={[2, 0.3, 1.2]} />
        <meshStandardMaterial color="#3d3d5c" />
      </mesh>
      <mesh position={[-0.7, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.8]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </group>
  )
}

function IdleScene() {
  return (
    <>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Person lying={false} />
      </Float>
      <Coins count={20} />
    </>
  )
}

function TangpingScene({ progress = 0 }: { progress?: number }) {
  const scattered = progress > 0.8
  return (
    <>
      <Bed />
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Person lying={true} />
      </Float>
      <Coins count={Math.max(5, Math.round(30 * (1 - progress)))} scattered={scattered} />
    </>
  )
}

export default function Scene3D({ mode, progress = 0 }: Props) {
  return (
    <Scene3DErrorBoundary
      fallback={
        <div className="w-full h-full bg-gradient-to-b from-[#0a0a1f] to-[#0a0a0f]" />
      }
    >
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 2, 2]} intensity={0.3} color="#6c63ff" />

        <Stars radius={50} depth={50} count={1000} factor={3} fade speed={1} />

        {mode === 'idle' && <IdleScene />}
        {mode === 'tangping' && <TangpingScene progress={progress} />}
      </Canvas>
    </Scene3DErrorBoundary>
  )
}
