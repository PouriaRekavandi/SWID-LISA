import React, { useEffect, useRef, useState } from 'react';

interface CosmicBackgroundProps {
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  radius: number;
  mass: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  // Track theme changes dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse coordinates tracking with smooth spring/inertia interpolation
    const mouse = {
      targetX: -1000,
      targetY: -1000,
      currentX: -1000,
      currentY: -1000,
      vx: 0,
      vy: 0,
      active: false,
      radius: 220, // Interaction field radius
      lastMoveTime: 0,
    };

    let shockwaves: Shockwave[] = [];

    // Theme-based cosmic color palettes
    const getThemeColors = () => {
      const dark = document.documentElement.classList.contains('dark');
      if (dark) {
        return {
          nodes: [
            'rgba(0, 184, 255, ',   // Cosmic Cyan (#00b8ff)
            'rgba(0, 255, 65, ',    // Quantum Green (#00ff41)
            'rgba(168, 85, 247, ',  // Deep Void Violet
            'rgba(56, 189, 248, ',  // Stellar Sky Blue
            'rgba(255, 255, 255, ', // Starlight White
          ],
          filament: 'rgba(0, 184, 255, ',
          filamentSecondary: 'rgba(0, 255, 65, ',
          mouseFilament: 'rgba(0, 255, 65, ',
          mouseAura: 'rgba(0, 184, 255, ',
          particleBase: [
            'rgba(0, 255, 65, ',
            'rgba(0, 184, 255, ',
            'rgba(192, 132, 252, ',
            'rgba(255, 255, 255, ',
          ],
          nebulaGradStart: 'rgba(3, 7, 18, 0.95)',
          nebulaGradEnd: 'rgba(5, 5, 5, 0.98)',
        };
      } else {
        return {
          nodes: [
            'rgba(2, 132, 199, ',   // Sky 600
            'rgba(5, 150, 105, ',   // Emerald 600
            'rgba(124, 58, 237, ',  // Violet 600
            'rgba(14, 116, 144, ',  // Cyan 700
          ],
          filament: 'rgba(2, 132, 199, ',
          filamentSecondary: 'rgba(5, 150, 105, ',
          mouseFilament: 'rgba(5, 150, 105, ',
          mouseAura: 'rgba(2, 132, 199, ',
          particleBase: [
            'rgba(5, 150, 105, ',
            'rgba(2, 132, 199, ',
            'rgba(124, 58, 237, ',
          ],
          nebulaGradStart: 'rgba(248, 250, 252, 0.95)',
          nebulaGradEnd: 'rgba(241, 245, 249, 0.98)',
        };
      }
    };

    let nodes: Node[] = [];
    let particles: Particle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initCosmicWeb();
    };

    const initCosmicWeb = () => {
      const colors = getThemeColors();
      const area = width * height;
      const isMobile = width < 768;
      // High-performance node and particle counts tailored for mobile smartphones and desktop
      const nodeCount = isMobile
        ? Math.floor(Math.min(24, Math.max(14, area / 20000)))
        : Math.floor(Math.min(65, Math.max(30, area / 22000)));
      const particleCount = isMobile
        ? Math.floor(Math.min(40, Math.max(22, area / 15000)))
        : Math.floor(Math.min(95, Math.max(45, area / 14000)));

      nodes = [];
      particles = [];

      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: 1.5 + Math.random() * 2.8,
          mass: 1.2 + Math.random() * 2.5,
          color: colors.nodes[i % colors.nodes.length],
          pulseSpeed: 0.015 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(spawnParticle(colors));
      }
    };

    const spawnParticle = (colors: ReturnType<typeof getThemeColors>): Particle => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const maxLife = 180 + Math.random() * 240;
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: 0.8 + Math.random() * 1.8,
        alpha: 0,
        maxAlpha: 0.25 + Math.random() * 0.55,
        life: Math.random() * maxLife,
        maxLife,
        color: colors.particleBase[Math.floor(Math.random() * colors.particleBase.length)],
      };
    };

    // Pointer move listener on window so it follows anywhere on the page
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      mouse.targetX = clientX;
      mouse.targetY = clientY;
      mouse.active = true;
      mouse.lastMoveTime = performance.now();

      // First time initialization for immediate responsiveness
      if (mouse.currentX === -1000) {
        mouse.currentX = clientX;
        mouse.currentY = clientY;
      }
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    // Cosmic shockwave pulse on click
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      if (clientX > 0 && clientY > 0) {
        shockwaves.push({
          x: clientX,
          y: clientY,
          radius: 10,
          maxRadius: 260,
          alpha: 0.75,
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    resize();

    // Render loop
    let lastTime = performance.now();
    let isHidden = false;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
      if (!isHidden) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (isHidden || width <= 0 || height <= 0) return;

      const dt = Math.min(Math.max(0.1, (now - lastTime) / 16.66 || 1), 2.5);
      lastTime = now;

      const colors = getThemeColors();

      // Clear canvas with subtle transparency for cosmic trailing effect
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinate interpolation (inertia)
      if (mouse.targetX !== -1000) {
        const dx = mouse.targetX - mouse.currentX;
        const dy = mouse.targetY - mouse.currentY;
        mouse.vx = dx * 0.12;
        mouse.vy = dy * 0.12;
        mouse.currentX += mouse.vx * dt;
        mouse.currentY += mouse.vy * dt;

        // Inactivity timeout: gradually fade influence if stationary for 4 seconds
        if (now - mouse.lastMoveTime > 4000) {
          mouse.active = false;
        } else {
          mouse.active = true;
        }
      } else {
        mouse.active = false;
      }

      // 1. Draw Subtle Interactive Mouse Gravitational Well / Aura
      if (mouse.active && mouse.currentX > 0 && mouse.currentY > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.currentX,
          mouse.currentY,
          0,
          mouse.currentX,
          mouse.currentY,
          mouse.radius
        );
        gradient.addColorStop(0, `${colors.mouseAura}0.18)`);
        gradient.addColorStop(0.4, `${colors.mouseFilament}0.07)`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, mouse.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing cursor nucleus core
        const corePulse = Math.sin(now * 0.005) * 1.5 + 4;
        ctx.fillStyle = `${colors.mouseFilament}0.8)`;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Halo ring around cursor
        ctx.strokeStyle = `${colors.mouseAura}0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, corePulse + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Shockwaves from clicks/touches
      shockwaves = shockwaves.filter((sw) => {
        sw.radius += 5.5 * dt;
        sw.alpha -= 0.016 * dt;

        if (sw.alpha > 0 && sw.radius < sw.maxRadius) {
          ctx.save();
          ctx.strokeStyle = `${colors.mouseAura}${sw.alpha})`;
          ctx.lineWidth = Math.max(0.1, 2 * (1 - sw.radius / sw.maxRadius));
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          return true;
        }
        return false;
      });

      // 3. Update & Draw Cosmic Web Nodes (Dark Matter Halos)
      const connectionDist = 135;
      const connectionDistSq = connectionDist * connectionDist;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Cosmic web natural drift
        node.x += node.vx * dt;
        node.y += node.vy * dt;

        // Bounce gently at viewport boundaries
        if (node.x < 10) {
          node.x = 10;
          node.vx *= -1;
        } else if (node.x > width - 10) {
          node.x = width - 10;
          node.vx *= -1;
        }
        if (node.y < 10) {
          node.y = 10;
          node.vy *= -1;
        } else if (node.y > height - 10) {
          node.y = height - 10;
          node.vy *= -1;
        }

        // Mouse gravitational attraction & vortex interaction
        if (mouse.active && mouse.currentX > 0) {
          const dx = mouse.currentX - node.x;
          const dy = mouse.currentY - node.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouse.radius * mouse.radius && distSq > 400) {
            const dist = Math.sqrt(distSq);
            const force = ((mouse.radius - dist) / mouse.radius) * 0.05;
            
            // Radial attraction (gravity)
            node.x += (dx / dist) * force * dt * 15;
            node.y += (dy / dist) * force * dt * 15;

            // Swirl / angular momentum (vortex)
            const angle = Math.atan2(dy, dx);
            const swirlForce = force * 4.5;
            node.x += -Math.sin(angle) * swirlForce * dt;
            node.y += Math.cos(angle) * swirlForce * dt;

            // Interactive dynamic filament connecting node directly to mouse cursor!
            const mouseAlpha = Math.max(0, (1 - dist / mouse.radius) * 0.45);
            ctx.strokeStyle = `${colors.mouseFilament}${mouseAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.currentX, mouse.currentY);
            ctx.stroke();
          }
        }

        // Pulse phase
        node.pulsePhase += node.pulseSpeed * dt;
        const currentRadius = node.radius + Math.sin(node.pulsePhase) * 0.6;

        // Render node halo
        ctx.fillStyle = `${node.color}0.65)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.8, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        // Connect filaments to neighboring nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const neighbor = nodes[j];
          const dx = neighbor.x - node.x;
          const dy = neighbor.y - node.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectionDist) * 0.22;
            ctx.strokeStyle = `${colors.filament}${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        }
      }

      // 4. Update & Draw Dark Matter Micro-Particles (Streaming Dust)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;

        // Fade in and out life cycle
        if (p.life < 30) {
          p.alpha = (p.life / 30) * p.maxAlpha;
        } else if (p.life > p.maxLife - 30) {
          p.alpha = ((p.maxLife - p.life) / 30) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        // Mouse gravitational deflection
        if (mouse.active && mouse.currentX > 0) {
          const dx = mouse.currentX - p.x;
          const dy = mouse.currentY - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < (mouse.radius * 0.85) ** 2 && distSq > 100) {
            const dist = Math.sqrt(distSq);
            const pull = (1 - dist / (mouse.radius * 0.85)) * 0.35;
            // Accelerate towards mouse with slight tangential orbital fling
            p.vx += ((dx / dist) * pull + (dy / dist) * pull * 0.6) * dt;
            p.vy += ((dy / dist) * pull - (dx / dist) * pull * 0.6) * dt;
            // Damp velocity to prevent runaway speed
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha = Math.min(1, p.alpha * 1.3);
          }
        }

        // Draw particle
        ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Respawn if dead or out of bounds
        if (
          p.life >= p.maxLife ||
          p.x < -20 ||
          p.x > width + 20 ||
          p.y < -20 ||
          p.y > height + 20
        ) {
          particles[i] = spawnParticle(colors);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      aria-hidden="true"
      style={{
        contain: 'strict',
      }}
    />
  );
};
