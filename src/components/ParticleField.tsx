import { useEffect, useRef } from "react";

/** Subtle floating gold dots over the hero. ~30 particles, opacity 0.12. */
const ParticleField = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = 30;
    const dots = Array.from({ length: N }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, r: 0,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots.forEach((d) => {
        d.x = Math.random() * w;
        d.y = Math.random() * h;
        d.vx = (Math.random() - 0.5) * 0.15;
        d.vy = (Math.random() - 0.5) * 0.15;
        d.r = 1 + Math.random() * 2.2;
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255, 209, 102, 0.12)";
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = w + 10; if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10; if (d.y > h + 10) d.y = -10;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 ${className}`} />;
};

export default ParticleField;
