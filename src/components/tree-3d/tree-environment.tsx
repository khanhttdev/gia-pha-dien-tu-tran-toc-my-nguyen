"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TreeEnvironmentProps {
    progress: number;
}

// Reduced particle count for performance
function Particles({ progress }: { progress: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 20; // Reduced from 40
    const particleProgress = Math.max(0, (progress - 0.5) / 0.5);
    const lastUpdateRef = useRef(0);

    useFrame((state) => {
        if (!meshRef.current || particleProgress <= 0) return;
        const t = state.clock.elapsedTime;

        // Only update every 3rd frame for performance
        if (t - lastUpdateRef.current < 0.05) return;
        lastUpdateRef.current = t;

        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            const seed = i * 137.5;
            const x = Math.sin(seed) * 2 + Math.sin(t * 0.3 + seed) * 0.3;
            const y = (seed % 3) + Math.sin(t * 0.4 + i) * 0.2 + 0.5;
            const z = Math.cos(seed) * 2 + Math.cos(t * 0.3 + seed) * 0.2;
            dummy.position.set(x, y, z);
            const s = particleProgress * (0.02 + (Math.sin(t + i) * 0.5 + 0.5) * 0.02);
            dummy.scale.setScalar(s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (particleProgress <= 0) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 4, 3]} />
            <meshStandardMaterial
                color="#e6c875"
                emissive="#e6c875"
                emissiveIntensity={1.5}
                transparent
                opacity={particleProgress * 0.6}
            />
        </instancedMesh>
    );
}

export default function TreeEnvironment({ progress }: TreeEnvironmentProps) {
    const ambientIntensity = 0.3 + progress * 0.4;
    const directionalIntensity = 0.5 + progress * 0.6;

    return (
        <>
            <ambientLight intensity={ambientIntensity} color="#f5e6d3" />
            <directionalLight position={[3, 5, 2]} intensity={directionalIntensity} color="#ffecd2" />
            {progress > 0.4 && (
                <pointLight position={[-2, 3, -1]} intensity={0.3 * (progress - 0.4)} color="#e6c875" distance={6} />
            )}
            <Particles progress={progress} />
        </>
    );
}
