import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Layers, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface Retina3DCanvasProps {
  scrollStage?: number; // 0 to 7
  className?: string;
}

export const Retina3DCanvas: React.FC<Retina3DCanvasProps> = ({
  scrollStage = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.18,
    rotY: -0.22,
    targetRotX: 0.18,
    targetRotY: -0.22,
    autoRotate: true,
  });

  const [autoRotate, setAutoRotate] = useState(true);
  const [showGnn, setShowGnn] = useState(true);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Cinematic Medical Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffdfb8, 2.2);
    mainKeyLight.position.set(5, 6, 6);
    scene.add(mainKeyLight);

    const fillEmeraldLight = new THREE.PointLight(0x1f7a5a, 2.8, 22);
    fillEmeraldLight.position.set(-6, -4, 4);
    scene.add(fillEmeraldLight);

    const rimAmberLight = new THREE.PointLight(0xe9a23b, 2.2, 18);
    rimAmberLight.position.set(4, -5, 2);
    scene.add(rimAmberLight);

    // 3. Central Retina Group
    const retinaGroup = new THREE.Group();
    scene.add(retinaGroup);

    // ─── 3A. PROCEDURAL FUNDUS RETINAL TEXTURE ───
    const createFundusTexture = () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      // Deep fundus background gradient
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, '#581a0e');
      grad.addColorStop(0.35, '#42130a');
      grad.addColorStop(0.7, '#2a0b06');
      grad.addColorStop(0.92, '#180503');
      grad.addColorStop(1, '#0c0201');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Choroidal microvascular mottling
      ctx.fillStyle = 'rgba(231, 111, 81, 0.08)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 8 + 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Optic Disc on texture (x: 360, y: 512)
      const discGrad = ctx.createRadialGradient(360, 512, 10, 360, 512, 65);
      discGrad.addColorStop(0, '#FFFDF8');
      discGrad.addColorStop(0.4, '#F7C978');
      discGrad.addColorStop(0.85, '#E9A23B');
      discGrad.addColorStop(1, 'rgba(184, 115, 30, 0)');
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.ellipse(360, 512, 65, 75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Macula / Fovea on texture (x: 680, y: 512)
      const macGrad = ctx.createRadialGradient(680, 512, 0, 680, 512, 90);
      macGrad.addColorStop(0, '#100302');
      macGrad.addColorStop(0.5, '#280704');
      macGrad.addColorStop(1, 'rgba(66, 19, 10, 0)');
      ctx.fillStyle = macGrad;
      ctx.beginPath();
      ctx.arc(680, 512, 90, 0, Math.PI * 2);
      ctx.fill();

      // Foveal reflex
      ctx.fillStyle = '#E76F51';
      ctx.beginPath();
      ctx.arc(680, 512, 3.5, 0, Math.PI * 2);
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const fundusTexture = createFundusTexture();

    // ─── 3B. RETINAL HEMISPHERICAL MANIFOLD DOME ───
    // An inverted sphere with gentle depth and rim falloff (no harsh cut equator)
    const domeGeo = new THREE.SphereGeometry(2.8, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const domeMat = new THREE.MeshStandardMaterial({
      map: fundusTexture,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.BackSide,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.rotation.x = Math.PI; // Face towards camera
    retinaGroup.add(domeMesh);

    // Subtle Outer Translucent Rim Ring (Softens the boundary)
    const rimGeo = new THREE.TorusGeometry(2.78, 0.045, 16, 100);
    const rimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1F7A5A'),
      transparent: true,
      opacity: 0.7,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    retinaGroup.add(rimMesh);

    // ─── 3C. LUMINOUS OPTIC NERVE HEAD & PHYSIOLOGIC CUP ───
    const discPos = new THREE.Vector3(-1.05, 0.1, -2.55);

    const discGlowGeo = new THREE.CircleGeometry(0.44, 32);
    const discGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E9A23B'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const discGlowMesh = new THREE.Mesh(discGlowGeo, discGlowMat);
    discGlowMesh.position.copy(discPos);
    discGlowMesh.position.z += 0.02;
    retinaGroup.add(discGlowMesh);

    const cupGeo = new THREE.CircleGeometry(0.2, 32);
    const cupMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFFDF8'),
      side: THREE.DoubleSide,
    });
    const cupMesh = new THREE.Mesh(cupGeo, cupMat);
    cupMesh.position.copy(discPos);
    cupMesh.position.z += 0.03;
    retinaGroup.add(cupMesh);

    // ─── 3D. FOVEA CENTRALIS & AVASCULAR ZONE (FAZ) ───
    const foveaPos = new THREE.Vector3(0.95, -0.05, -2.62);
    const foveaGroup = new THREE.Group();

    const foveaAuraGeo = new THREE.RingGeometry(0.08, 0.32, 32);
    const foveaAuraMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1A0604'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    foveaGroup.add(new THREE.Mesh(foveaAuraGeo, foveaAuraMat));

    const foveaDotGeo = new THREE.CircleGeometry(0.045, 16);
    const foveaDotMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E76F51'),
      side: THREE.DoubleSide,
    });
    const foveaDot = new THREE.Mesh(foveaDotGeo, foveaDotMat);
    foveaDot.position.z = 0.01;
    foveaGroup.add(foveaDot);

    foveaGroup.position.copy(foveaPos);
    retinaGroup.add(foveaGroup);

    // ─── 3E. 3D ANATOMICAL VASCULAR NETWORK (Catmull-Rom Splines) ───
    const vesselBranches = [
      // 1. Superior Temporal Artery & Arcades
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-0.6, 0.85, -2.58],
          [0.2, 1.45, -2.42],
          [1.1, 1.5, -2.22],
          [1.9, 1.15, -1.98],
        ],
        radius: 0.038,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      {
        points: [
          [0.2, 1.45, -2.42],
          [0.7, 1.85, -2.15],
          [1.3, 2.05, -1.82],
        ],
        radius: 0.024,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      // 2. Inferior Temporal Artery & Arcades
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-0.55, -0.75, -2.58],
          [0.3, -1.35, -2.45],
          [1.2, -1.4, -2.25],
          [2.0, -1.0, -1.98],
        ],
        radius: 0.038,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      {
        points: [
          [0.3, -1.35, -2.45],
          [0.85, -1.75, -2.18],
          [1.4, -1.95, -1.85],
        ],
        radius: 0.024,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      // 3. Superior Temporal Vein (Deep Emerald / Forest)
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-0.75, 0.95, -2.55],
          [0.05, 1.6, -2.38],
          [1.0, 1.65, -2.18],
          [1.75, 1.3, -1.95],
        ],
        radius: 0.046,
        color: '#1F7A5A',
        emissive: '#092d21',
      },
      // 4. Inferior Temporal Vein
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-0.7, -0.85, -2.55],
          [0.15, -1.5, -2.42],
          [1.05, -1.55, -2.2],
          [1.85, -1.15, -1.95],
        ],
        radius: 0.046,
        color: '#1F7A5A',
        emissive: '#092d21',
      },
      // 5. Nasal Artery & Vein Branches
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-1.5, 0.7, -2.48],
          [-1.9, 1.25, -2.22],
          [-2.2, 1.55, -1.88],
        ],
        radius: 0.034,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      {
        points: [
          [-1.05, 0.1, -2.55],
          [-1.55, -0.65, -2.48],
          [-1.95, -1.15, -2.2],
          [-2.25, -1.45, -1.85],
        ],
        radius: 0.038,
        color: '#1F7A5A',
        emissive: '#092d21',
      },
      // 6. Perifoveal Terminal Capillaries
      {
        points: [
          [-0.6, 0.85, -2.58],
          [0.2, 0.45, -2.62],
          [0.75, 0.25, -2.62],
        ],
        radius: 0.02,
        color: '#E76F51',
        emissive: '#781c0c',
      },
      {
        points: [
          [-0.55, -0.75, -2.58],
          [0.25, -0.45, -2.62],
          [0.8, -0.3, -2.62],
        ],
        radius: 0.02,
        color: '#E76F51',
        emissive: '#781c0c',
      },
    ];

    const vesselsGroup = new THREE.Group();
    vesselBranches.forEach(branch => {
      const vectors = branch.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(vectors);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, branch.radius, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(branch.color),
        roughness: 0.25,
        metalness: 0.15,
        emissive: new THREE.Color(branch.emissive),
        emissiveIntensity: 0.55,
      });
      vesselsGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    });
    retinaGroup.add(vesselsGroup);

    // ─── 3F. HOLOGRAPHIC HUMPHREY PERIMETER HUD RINGS (10°, 20°, 30°, 45°) ───
    const hudGroup = new THREE.Group();
    const ringRadii = [0.9, 1.6, 2.2, 2.75];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(idx === 3 ? '#1F7A5A' : '#E9A23B'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: idx === 3 ? 0.6 : 0.25,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = -1.2 + idx * 0.15;
      hudGroup.add(ringMesh);
    });

    // Crosshair axis lines
    const axisMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#1F7A5A'),
      transparent: true,
      opacity: 0.35,
    });

    // Horizontal & Vertical axes
    const hAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.8, 0, -0.8),
      new THREE.Vector3(2.8, 0, -0.8),
    ]);
    const vAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.8, -0.8),
      new THREE.Vector3(0, 2.8, -0.8),
    ]);
    hudGroup.add(new THREE.Line(hAxisGeo, axisMat));
    hudGroup.add(new THREE.Line(vAxisGeo, axisMat));

    scene.add(hudGroup);

    // ─── 3G. ROTATING SCANNING LASER BEAM (OCT / SLO SCANNER) ───
    const scannerGroup = new THREE.Group();
    const sweepGeo = new THREE.PlaneGeometry(5.6, 0.04);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E76F51'),
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat);
    scannerGroup.add(sweepMesh);

    // Laser glow fan
    const fanGeo = new THREE.RingGeometry(0.1, 2.8, 32, 1, 0, Math.PI * 0.12);
    const fanMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1F7A5A'),
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const fanMesh = new THREE.Mesh(fanGeo, fanMat);
    fanMesh.rotation.z = -Math.PI * 0.06;
    scannerGroup.add(fanMesh);

    scannerGroup.position.z = -0.6;
    scene.add(scannerGroup);

    // ─── 3H. TOPOLOGICAL GNN NODES & SYNAPTIC EDGES ───
    const gnnGroup = new THREE.Group();
    const gnnNodePositions = [
      new THREE.Vector3(-1.05, 0.1, -2.55),  // Disc Center
      new THREE.Vector3(0.95, -0.05, -2.62), // Fovea Center
      new THREE.Vector3(-0.6, 0.85, -2.58),  // ST Bifurcation
      new THREE.Vector3(0.2, 1.45, -2.42),   // ST Terminal
      new THREE.Vector3(-0.55, -0.75, -2.58),// IT Bifurcation
      new THREE.Vector3(0.3, -1.35, -2.45),  // IT Terminal
      new THREE.Vector3(0.4, 0.65, -2.55),   // Microaneurysm Cluster
      new THREE.Vector3(0.75, 0.6, -2.52),   // Hard Exudate Plaque
      new THREE.Vector3(0.35, -0.85, -2.55), // Blot Bleed
      new THREE.Vector3(-1.5, 0.7, -2.48),   // Nasal Arc
    ];

    gnnNodePositions.forEach((pos, idx) => {
      const isAnchor = idx < 2;
      const isLesion = idx >= 6 && idx <= 8;
      const nodeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(isAnchor ? 0.08 : isLesion ? 0.065 : 0.045, 16, 16),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(
            idx === 1 ? '#E76F51' : idx === 0 ? '#E9A23B' : isLesion ? '#E76F51' : '#1F7A5A'
          ),
        })
      );
      nodeMesh.position.copy(pos);
      gnnGroup.add(nodeMesh);
    });

    // Connecting GNN graph edges
    const edgeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#E9A23B'),
      transparent: true,
      opacity: 0.35,
    });
    for (let i = 0; i < gnnNodePositions.length; i++) {
      for (let j = i + 1; j < gnnNodePositions.length; j++) {
        if (gnnNodePositions[i].distanceTo(gnnNodePositions[j]) < 1.7) {
          const edgeGeo = new THREE.BufferGeometry().setFromPoints([
            gnnNodePositions[i],
            gnnNodePositions[j],
          ]);
          gnnGroup.add(new THREE.Line(edgeGeo, edgeMat));
        }
      }
    }
    retinaGroup.add(gnnGroup);

    // ─── 3I. FLOATING METABOLIC BIO-PARTICLE CLOUD ───
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const palette = [
      new THREE.Color('#E9A23B'),
      new THREE.Color('#1F7A5A'),
      new THREE.Color('#E76F51'),
      new THREE.Color('#FFFDF8'),
    ];

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + Math.random() * 0.8;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) * 0.8 - 0.4;

      const c = palette[i % palette.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    retinaGroup.add(particlePoints);

    // ─── 4. MOUSE DRAG & ORBIT LISTENER ───
    const onMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDragging = true;
      mouseRef.current.prevX = e.clientX;
      mouseRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDragging) return;
      const dx = e.clientX - mouseRef.current.prevX;
      const dy = e.clientY - mouseRef.current.prevY;
      mouseRef.current.targetRotY += dx * 0.007;
      mouseRef.current.targetRotX += dy * 0.007;
      mouseRef.current.targetRotX = Math.max(-0.65, Math.min(0.65, mouseRef.current.targetRotX));
      mouseRef.current.prevX = e.clientX;
      mouseRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      mouseRef.current.isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile/tablets
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        mouseRef.current.isDragging = true;
        mouseRef.current.prevX = e.touches[0].clientX;
        mouseRef.current.prevY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!mouseRef.current.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - mouseRef.current.prevX;
      const dy = e.touches[0].clientY - mouseRef.current.prevY;
      mouseRef.current.targetRotY += dx * 0.008;
      mouseRef.current.targetRotX += dy * 0.008;
      mouseRef.current.prevX = e.touches[0].clientX;
      mouseRef.current.prevY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      mouseRef.current.isDragging = false;
    };

    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // ─── 5. ANIMATION & RENDER LOOP WITH VIEWPORT VISIBILITY CULLING ───
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isCanvasVisible = true;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isCanvasVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isCanvasVisible) return; // Pause rendering loop when off-screen to save 100% GPU
      const elapsed = clock.getElapsedTime();

      // Smooth rotation dampening
      mouseRef.current.rotX += (mouseRef.current.targetRotX - mouseRef.current.rotX) * 0.08;
      mouseRef.current.rotY += (mouseRef.current.targetRotY - mouseRef.current.rotY) * 0.08;

      // Auto idle rotation
      if (mouseRef.current.autoRotate && !mouseRef.current.isDragging) {
        mouseRef.current.targetRotY += 0.0035;
      }

      retinaGroup.rotation.x = mouseRef.current.rotX;
      retinaGroup.rotation.y = mouseRef.current.rotY;

      // Pulse Optic Disc glow
      discGlowMat.opacity = 0.85 + Math.sin(elapsed * 2.8) * 0.12;

      // Rotating Scanner Beam
      if (showScanner) {
        scannerGroup.visible = true;
        scannerGroup.rotation.z = elapsed * 0.8;
      } else {
        scannerGroup.visible = false;
      }

      // GNN Visibility
      gnnGroup.visible = showGnn;

      // Breathing Particle Orbit
      particlePoints.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // ─── 6. RESIZE HANDLER ───
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      visibilityObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showGnn, showScanner]);

  const toggleAutoRotate = () => {
    setAutoRotate(prev => {
      mouseRef.current.autoRotate = !prev;
      return !prev;
    });
  };

  const resetView = () => {
    mouseRef.current.targetRotX = 0.18;
    mouseRef.current.targetRotY = -0.22;
  };

  return (
    <div className={`relative w-full h-full min-h-[420px] select-none ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Interactive HUD Overlay Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-1 rounded-xl bg-[#06150F]/80 backdrop-blur-md border border-[#1F7A5A]/30 shadow-md">
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            autoRotate ? 'bg-[#124B3A] text-white' : 'text-[#8BA196] hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => setShowGnn(!showGnn)}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            showGnn ? 'bg-[#124B3A] text-white' : 'text-[#8BA196] hover:text-white'
          }`}
          title="Toggle GNN Neural Graph"
        >
          <Layers size={14} />
        </button>

        <button
          onClick={() => setShowScanner(!showScanner)}
          className={`p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
            showScanner ? 'bg-[#124B3A] text-white' : 'text-[#8BA196] hover:text-white'
          }`}
          title="Toggle Scanning Laser Beam"
        >
          <Sparkles size={14} />
        </button>

        <button
          onClick={resetView}
          className="p-2 rounded-lg text-xs text-[#8BA196] hover:text-white transition-all flex items-center gap-1.5"
          title="Reset Camera Angle"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Interactive Drag Hint */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-[#06150F]/80 backdrop-blur-md border border-[#1F7A5A]/30 text-[10px] font-mono text-[#FFFDF8] flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#1F7A5A] animate-pulse" />
        <span>Click & Drag to Rotate 360° • Humphrey 45° Grid</span>
      </div>
    </div>
  );
};
