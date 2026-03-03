"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GrowingTreeProps {
    progress: number; // 0 to 1
}

interface BranchData {
    start: THREE.Vector3;
    end: THREE.Vector3;
    radius: number;
    depth: number;
}

// Seeded random for consistent tree shape
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

// Generate branch data — reduced complexity (maxDepth=3, fewer branches)
function generateBranches(
    depth: number, maxDepth: number, angle: number,
    length: number, position: THREE.Vector3, direction: THREE.Vector3,
    rng: () => number
): BranchData[] {
    if (depth > maxDepth) return [];

    const branches: BranchData[] = [];
    const end = position.clone().add(direction.clone().multiplyScalar(length));

    branches.push({ start: position.clone(), end: end.clone(), radius: 0.1 * Math.pow(0.6, depth), depth });

    if (depth < maxDepth) {
        const branchCount = depth === 0 ? 3 : 2;
        for (let i = 0; i < branchCount; i++) {
            const spreadAngle = angle + (rng() - 0.5) * 0.4;
            const rotAngle = (i / branchCount) * Math.PI * 2 + rng() * 0.5;
            const newDir = new THREE.Vector3(
                Math.sin(spreadAngle) * Math.cos(rotAngle),
                Math.cos(spreadAngle) * 0.8 + 0.2,
                Math.sin(spreadAngle) * Math.sin(rotAngle)
            ).normalize();
            const newLength = length * (0.55 + rng() * 0.15);
            branches.push(...generateBranches(depth + 1, maxDepth, spreadAngle + 0.15, newLength, end, newDir, rng));
        }
    }

    return branches;
}

// All branches rendered as a single merged BufferGeometry for performance
function TreeBranches({ branches, progress }: { branches: BranchData[]; progress: number }) {
    const meshRef = useRef<THREE.Group>(null);

    return (
        <group ref={meshRef}>
            {branches.map((b, i) => {
                const depthThreshold = b.depth * 0.18;
                const bp = Math.max(0, Math.min(1, (progress - depthThreshold) / 0.25));
                if (bp <= 0) return null;

                const dir = b.end.clone().sub(b.start);
                const len = dir.length() * bp;
                const mid = b.start.clone().add(dir.clone().normalize().multiplyScalar(len / 2));
                const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

                return (
                    <mesh key={i} position={[mid.x, mid.y, mid.z]} quaternion={q}>
                        <cylinderGeometry args={[b.radius * 0.5, b.radius, len, 5]} />
                        <meshStandardMaterial color={b.depth < 2 ? "#4a2810" : "#5c3317"} roughness={0.9} />
                    </mesh>
                );
            })}
        </group>
    );
}

// Optimized leaves — use instanced mesh but only update once, not every frame
function Leaves({ branches, progress }: { branches: BranchData[]; progress: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const leafProgress = Math.max(0, (progress - 0.5) / 0.5);
    const rng = useMemo(() => seededRandom(99), []);

    const leafPositions = useMemo(() => {
        const positions: THREE.Vector3[] = [];
        branches.forEach((b) => {
            if (b.depth >= 2) {
                const count = b.depth >= 3 ? 4 : 2;
                for (let i = 0; i < count; i++) {
                    const t = 0.4 + rng() * 0.6;
                    const pos = b.start.clone().lerp(b.end, t);
                    pos.x += (rng() - 0.5) * 0.3;
                    pos.y += (rng() - 0.5) * 0.2;
                    pos.z += (rng() - 0.5) * 0.3;
                    positions.push(pos);
                }
            }
        });
        return positions;
    }, [branches, rng]);

    // Update matrices only when leafProgress changes significantly
    const lastProgressRef = useRef(0);
    useFrame(() => {
        if (!meshRef.current || leafProgress <= 0) return;
        if (Math.abs(leafProgress - lastProgressRef.current) < 0.02) return;
        lastProgressRef.current = leafProgress;

        const dummy = new THREE.Object3D();
        const lr = seededRandom(200);
        leafPositions.forEach((pos, i) => {
            dummy.position.copy(pos);
            dummy.scale.setScalar(leafProgress * (0.8 + lr() * 0.4));
            dummy.rotation.set(lr() * Math.PI, lr() * Math.PI, lr() * Math.PI);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (leafProgress <= 0 || leafPositions.length === 0) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, leafPositions.length]}>
            <sphereGeometry args={[0.12, 5, 3]} />
            <meshStandardMaterial color="#3a6b2f" roughness={0.8} transparent opacity={leafProgress} />
        </instancedMesh>
    );
}

// Simple sprout
function Sprout({ progress }: { progress: number }) {
    const sp = Math.min(1, progress * 5);
    if (progress > 0.3) return null;

    return (
        <group>
            <mesh position={[0, sp * 0.1, 0]}>
                <sphereGeometry args={[0.06 * (1 - sp * 0.5), 6, 4]} />
                <meshStandardMaterial color="#5c3317" roughness={0.9} />
            </mesh>
            {sp > 0.3 && (
                <>
                    <mesh position={[-0.03, 0.15 * sp, 0]} rotation={[0, 0, -0.3]}>
                        <planeGeometry args={[0.06 * sp, 0.1 * sp]} />
                        <meshStandardMaterial color="#4a7c3f" side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0.03, 0.12 * sp, 0]} rotation={[0, 0, 0.4]}>
                        <planeGeometry args={[0.05 * sp, 0.08 * sp]} />
                        <meshStandardMaterial color="#4a7c3f" side={THREE.DoubleSide} />
                    </mesh>
                </>
            )}
        </group>
    );
}

export default function GrowingTree({ progress }: GrowingTreeProps) {
    const groupRef = useRef<THREE.Group>(null);

    const branches = useMemo(() => {
        const rng = seededRandom(42);
        return generateBranches(0, 3, 0.4, 1.2, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), rng);
    }, []);

    // Gentle sway — only when fully grown
    useFrame((state) => {
        if (groupRef.current && progress > 0.6) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
        }
    });

    return (
        <group ref={groupRef} position={[0, -1.5, 0]}>
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 16]} />
                <meshStandardMaterial color="#2a1a0a" roughness={1} />
            </mesh>
            <Sprout progress={progress} />
            <TreeBranches branches={branches} progress={progress} />
            <Leaves branches={branches} progress={progress} />
        </group>
    );
}
