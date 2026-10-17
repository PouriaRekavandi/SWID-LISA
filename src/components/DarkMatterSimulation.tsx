import React, { useEffect, useRef, useState } from 'react';

interface DarkMatterSimulationProps {
  className?: string;
  interactive?: boolean;
}

interface CosmicNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  baseRadius: number;
  pulsePhase: number;
  color: string;
  isCore?: boolean;
}

interface DarkMatterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetNodeIndex: number;
  life: number;
  maxLife: number;
  speed: number;
  color: string;
}

export const DarkMatterSimulation: React.FC<DarkMatterSimulationProps> = ({
  className = '',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const [isPaused, setIsPaused] = useState(false);
  const [densityMode, setDensityMode] = useState<'standard' | 'high'>('standard');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Cosmic color palette representing dark matter gravitational potential wells
    const palette = [
      'rgba(0, 184, 255, ',   // Cosmic Cyan
      'rgba(0, 255, 65, ',    // Quantum Neon Green
      'rgba(147, 51, 234, ',  // Deep Gravitational Violet
      'rgba(56, 189, 248, ',  // Baryonic Sky Blue
      'rgba(255, 255, 255, ', // Stellar White
    ];

    let nodes: CosmicNode[] = [];
    let particles: DarkMatterParticle[] = [];

    const initSimulation = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const centerX = width / 2;
      const centerY = height * 0.42; // Centered behind the logo crest
      const nodeCount = densityMode === 'high' ? 65 : 45;
      const particleCount = densityMode === 'high' ? 360 : 220;

      nodes = [];
      particles = [];

      // 1. Central Core Halos (gravitational anchor directly behind crest)
      const coreHaloCount = 7;
      for (let i = 0; i < coreHaloCount; i++) {
        const angle = (i / coreHaloCount) * Math.PI * 2;
        const dist = 30 + Math.random() * 85;
        nodes.push({
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          mass: 3.5 + Math.random() * 2.5,
          baseRadius: 4 + Math.random() * 4,
          pulsePhase: Math.random() * Math.PI * 2,
          color: palette[i % 3],
          isCore: true,
        });
      }

      // 2. Cosmic Web Halos extending outward
      for (let i = 0; i < nodeCount - coreHaloCount; i++) {
        // Bias nodes towards radial filaments around the center
        const radialAngle = Math.random() * Math.PI * 2;
        const radialDist = 80 + Math.pow(Math.random(), 1.4) * (Math.max(width, height) * 0.55);
        nodes.push({
          x: Math.max(20, Math.min(width - 20, centerX + Math.cos(radialAngle) * radialDist)),
          y: Math.max(20, Math.min(height - 20, centerY + Math.sin(radialAngle) * radialDist)),
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          mass: 1.5 + Math.random() * 2.0,
          baseRadius: 2.2 + Math.random() * 3.0,
          pulsePhase: Math.random() * Math.PI * 2,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }

      // 3. Dark Matter Flow Particles
      for (let i = 0; i < particleCount; i++) {
        const targetNode = Math.floor(Math.random() * nodes.length);
        const sourceNode = Math.floor(Math.random() * nodes.length);
        const src = nodes[sourceNode];
        const tgt = nodes[targetNode];

        // Position along filament or randomly in cosmic void
        const t = Math.random();
        const px = src.x * (1 - t) + tgt.x * t + (Math.random() - 0.5) * 30;
        const py = src.y * (1 - t) + tgt.y * t + (Math.random() - 0.5) * 30;

        particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 1 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.7,
          targetNodeIndex: targetNode,
          life: Math.random() * 400,
          maxLife: 250 + Math.random() * 300,
          speed: 0.3 + Math.random() * 0.7,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    initSimulation();

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      initSimulation();
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for gravitational lensing interaction without blocking clicks or touches
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        };
      } else {
        mouseRef.current.active = false;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isPaused) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Cosmic filament connection threshold
        const maxDist = densityMode === 'high' ? 170 : 145;
        const mouse = mouseRef.current;

        // 1. Update & Render Nodes (Cosmic Halos)
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          // Gentle cosmic drift
          node.x += node.vx * dt * 45;
          node.y += node.vy * dt * 45;

          // Soft boundary bounce
          if (node.x < 30 || node.x > width - 30) node.vx *= -1;
          if (node.y < 30 || node.y > height - 30) node.vy *= -1;

          // Mouse gravitational interaction
          if (mouse.active) {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180 && dist > 1) {
              const force = (180 - dist) / 180 * 0.4;
              node.x += (dx / dist) * force;
              node.y += (dy / dist) * force;
            }
          }

          node.pulsePhase += dt * 1.8;
          const pulse = Math.sin(node.pulsePhase) * 0.4 + 1;
          const currentRadius = node.baseRadius * pulse;

          // Radial dark matter potential well glow
          const glowGrad = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, currentRadius * 4.5
          );
          glowGrad.addColorStop(0, `${node.color}${node.isCore ? '0.45' : '0.25'})`);
          glowGrad.addColorStop(0.5, `${node.color}${node.isCore ? '0.15' : '0.06'})`);
          glowGrad.addColorStop(1, `${node.color}0)`);

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius * 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright stellar core node
          ctx.fillStyle = `${node.color}0.9)`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Render Cosmic Web Filaments
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const alpha = Math.pow(1 - dist / maxDist, 1.3) * (n1.isCore || n2.isCore ? 0.38 : 0.22);
              
              const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
              grad.addColorStop(0, `${n1.color}${alpha})`);
              grad.addColorStop(1, `${n2.color}${alpha})`);

              ctx.strokeStyle = grad;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);

              // Gravitational curved filament effect
              const midX = (n1.x + n2.x) / 2;
              const midY = (n1.y + n2.y) / 2;
              const curveFactor = Math.sin(time * 0.001 + i + j) * 8;
              ctx.quadraticCurveTo(midX + curveFactor, midY + curveFactor, n2.x, n2.y);
              ctx.stroke();
            }
          }
        }

        // 3. Render Streaming Dark Matter Tracer Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const target = nodes[p.targetNodeIndex];

          if (!target) continue;

          // Accelerate toward target cosmic node
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 5) {
            const accel = (p.speed * 40) / Math.max(dist, 40);
            p.vx += (dx / dist) * accel * dt;
            p.vy += (dy / dist) * accel * dt;
          } else {
            // Reached node: select new distant cosmic halo
            p.targetNodeIndex = Math.floor(Math.random() * nodes.length);
            p.life = 0;
          }

          // Damping to avoid particle escape
          p.vx *= 0.985;
          p.vy *= 0.985;

          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.life += dt * 60;

          if (p.life > p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            // Respawn along a random filament
            const randNode = nodes[Math.floor(Math.random() * nodes.length)];
            p.x = randNode.x + (Math.random() - 0.5) * 50;
            p.y = randNode.y + (Math.random() - 0.5) * 50;
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = (Math.random() - 0.5) * 0.5;
            p.life = 0;
            p.targetNodeIndex = Math.floor(Math.random() * nodes.length);
          }

          // Draw tracer particle with motion trail
          const lifeAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.alpha;
          ctx.fillStyle = `${p.color}${lifeAlpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Central Cosmic Singularity / Halo glow directly behind logo crest
        const crestX = width / 2;
        const crestY = height * 0.42;
        const centerGrad = ctx.createRadialGradient(
          crestX, crestY, 20,
          crestX, crestY, Math.min(width, height) * 0.48
        );
        centerGrad.addColorStop(0, 'rgba(0, 184, 255, 0.22)');
        centerGrad.addColorStop(0.35, 'rgba(0, 255, 65, 0.12)');
        centerGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.06)');
        centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(crestX, crestY, Math.min(width, height) * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPaused, densityMode, interactive]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none opacity-90 transition-opacity duration-700"
        title="Interactive Universe Dark Matter Cosmic Web Simulation"
      />
      
      {/* Subtle Simulation Telemetry HUD */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2 text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 select-none">
        <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
        <span className="text-[#00b8ff] font-bold">DM-SIM //</span>
        <span>Cosmic Web Filaments</span>
        <button
          onClick={() => setDensityMode(d => d === 'standard' ? 'high' : 'standard')}
          className="ml-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          title="Toggle Dark Matter particle density"
        >
          {densityMode === 'high' ? 'Dense' : 'Opt'}
        </button>
        <button
          onClick={() => setIsPaused(p => !p)}
          className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
          title="Pause or resume cosmic motion"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};
