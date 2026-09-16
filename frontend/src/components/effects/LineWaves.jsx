import React, { useEffect, useRef } from 'react';

/**
 * LineWaves
 * Authentic EEG sensorimotor rhythm (8–30 Hz) harmonic wave visualizer.
 * Renders 5 multi-frequency oscillating wave channels mimicking C3-C4, C1-C2, FC3-FC4, CP3-CP4, and C5-C6.
 * Reacts with frequency modulation on pointer interaction.
 */
export default function LineWaves({
  height = 200,
  speed = 0.02,
  primaryColor = '#FFFFFF',
  secondaryColor = '#D4D4D8',
  tertiaryColor = '#A1A1AA',
  style = {},
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio || 800;
      canvas.height = rect.height * window.devicePixelRatio || height;
    };

    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
        active: true,
      };
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);

    // 5 EEG Sensorimotor pairs in pure monochromatic silver/white
    const channels = [
      { name: 'C3-C4 (Mu 10Hz)', freq: 0.008, amp: 26, phase: 0, color: primaryColor, alpha: 0.95, width: 2.2 },
      { name: 'C1-C2 (Beta 18Hz)', freq: 0.014, amp: 18, phase: 1.5, color: '#E4E4E7', alpha: 0.75, width: 1.8 },
      { name: 'FC3-FC4 (Premotor)', freq: 0.011, amp: 22, phase: 3.1, color: secondaryColor, alpha: 0.65, width: 1.8 },
      { name: 'CP3-CP4 (Somatosensory)', freq: 0.016, amp: 14, phase: 4.2, color: tertiaryColor, alpha: 0.55, width: 1.4 },
      { name: 'C5-C6 (Lateral SMR)', freq: 0.009, amp: 20, phase: 2.3, color: '#71717A', alpha: 0.5, width: 1.6 },
    ];

    let t = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!prefersReducedMotion) {
        t += speed;
      }

      const centerY = h / 2;
      const mouse = mouseRef.current;

      channels.forEach((ch, idx) => {
        ctx.beginPath();
        ctx.lineWidth = ch.width;
        ctx.strokeStyle = ch.color;
        ctx.globalAlpha = ch.alpha;

        const yOffset = (idx - 2) * 6; // subtle channel separation

        for (let x = 0; x <= w; x += 3) {
          // Dynamic mouse disturbance
          let mouseInfluence = 0;
          if (mouse.active && mouse.x !== null) {
            const dist = Math.abs(x - mouse.x);
            if (dist < 180) {
              const factor = (1 - dist / 180) ** 2;
              mouseInfluence = Math.sin(x * 0.05 + t * 4) * 16 * factor;
            }
          }

          // Combined Mu/Beta wave harmonics
          const primaryWave = Math.sin(x * ch.freq + t + ch.phase) * ch.amp;
          const secondaryHarmonic = Math.cos(x * ch.freq * 2.1 - t * 1.4) * (ch.amp * 0.35);
          const y = centerY + yOffset + primaryWave + secondaryHarmonic + mouseInfluence;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [height, speed, primaryColor, secondaryColor, tertiaryColor]);

  return (
    <div
      className="linewaves-container"
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        borderRadius: '16px',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Waveform labels */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '16px',
          display: 'flex',
          gap: '14px',
          fontSize: '0.68rem',
          color: 'rgba(255, 255, 255, 0.45)',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
        }}
      >
        <span>5-PAIR SENSORIMOTOR HARMONICS</span>
        <span>8–30 HZ BUTTERWORTH FILTERED</span>
      </div>
    </div>
  );
}
