import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RetinaMotionCanvasProps {
  className?: string;
  intensity?: number; // 0.1 to 1.0
  interactive?: boolean;
  showScanRing?: boolean;
}

export const RetinaMotionCanvas: React.FC<RetinaMotionCanvasProps> = ({
  className = '',
  intensity = 0.6,
  interactive = true,
  showScanRing = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 500;
      height = canvas.height = canvas.offsetHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    // Corpuscles / particles for retinal vessel flow
    const particleCount = Math.floor(35 * intensity);
    const particles = Array.from({ length: particleCount }, () => ({
      x: width * 0.5 + (Math.random() - 0.5) * width * 0.7,
      y: height * 0.5 + (Math.random() - 0.5) * height * 0.7,
      radius: Math.random() * 1.8 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      // Approved warm/emerald colors only
      color: Math.random() > 0.4 ? '#1F7A5A' : '#E9A23B',
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax interpolation
      currentOffset.current.x += (mouseOffset.current.x - currentOffset.current.x) * 0.08;
      currentOffset.current.y += (mouseOffset.current.y - currentOffset.current.y) * 0.08;

      const centerX = width * 0.5 + currentOffset.current.x;
      const centerY = height * 0.5 + currentOffset.current.y;

      // 1. Central Macular & Disc Ambient Glow
      const glowRadius = Math.min(width, height) * 0.4;
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        glowRadius
      );
      gradient.addColorStop(0, 'rgba(31, 122, 90, 0.14)');
      gradient.addColorStop(0.4, 'rgba(233, 162, 59, 0.06)');
      gradient.addColorStop(1, 'rgba(18, 75, 58, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Radar Scan Rings
      if (showScanRing) {
        const ringProgress = (time * 0.3) % 1;
        const currentRingRadius = glowRadius * 0.8 * ringProgress;

        ctx.strokeStyle = `rgba(233, 162, 59, ${(1 - ringProgress) * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRingRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary subtle outer ring
        const ringProgress2 = ((time * 0.3) + 0.5) % 1;
        const currentRingRadius2 = glowRadius * 0.8 * ringProgress2;
        ctx.strokeStyle = `rgba(31, 122, 90, ${(1 - ringProgress2) * 0.3})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRingRadius2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Simulated Vessel Arcs with traveling pulse
      ctx.lineWidth = 1.5;
      const arcCount = 4;
      for (let i = 0; i < arcCount; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.strokeStyle = 'rgba(18, 75, 58, 0.12)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const cpX = centerX + Math.cos(angle) * (glowRadius * 0.5);
        const cpY = centerY + Math.sin(angle) * (glowRadius * 0.3);
        const endX = centerX + Math.cos(angle) * glowRadius * 0.9;
        const endY = centerY + Math.sin(angle) * glowRadius * 0.9;
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }

      // 4. Floating Micro-Corpuscles / Particle Movement
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.8 + 0.2 * Math.sin(time * 2 + p.x));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, showScanRing]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Depth parallax factor (max 15px)
    mouseOffset.current = {
      x: (x / rect.width) * 20,
      y: (y / rect.height) * 20,
    };
  };

  const handleMouseLeave = () => {
    mouseOffset.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
