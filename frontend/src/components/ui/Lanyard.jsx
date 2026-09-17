import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Cpu, Award } from 'lucide-react';

/**
 * Lanyard
 * Interactive physics-based hanging BCI Researcher ID Badge on an elastic cord.
 * The card reacts to mouse dragging, spring kinematics, inertia, and 3D tilt.
 */
export default function Lanyard({
  name = 'NEUROMOVE RESEARCH COHORT',
  id = 'BCI-09741-LEAKAGE-FREE',
  affiliation = 'NeuroImage 328 (2026) · PhysioNet',
  status = 'VERIFIED STRATIFIED',
  className = '',
  style = {},
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0, a: 0 });

  useEffect(() => {
    let animId;

    const updatePhysics = () => {
      if (!isDragging) {
        // Spring forces pulling back to (0, 0)
        const k = 0.08;
        const damping = 0.88;

        vel.current.x = (vel.current.x - pos.x * k) * damping;
        vel.current.y = (vel.current.y - pos.y * k) * damping;
        vel.current.a = (vel.current.a - angle * 0.06) * 0.86;

        setPos((prev) => ({
          x: Math.abs(prev.x + vel.current.x) < 0.01 ? 0 : prev.x + vel.current.x,
          y: Math.abs(prev.y + vel.current.y) < 0.01 ? 0 : prev.y + vel.current.y,
        }));

        setAngle((prev) => (Math.abs(prev + vel.current.a) < 0.01 ? 0 : prev + vel.current.a));
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isDragging, pos, angle]);

  const onPointerDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const newX = Math.max(-120, Math.min(120, e.clientX - dragStart.current.x));
    const newY = Math.max(-20, Math.min(140, e.clientY - dragStart.current.y));

    // Calculate dynamic tilt angle from horizontal drag
    const newAngle = (newX / 120) * 22;

    vel.current.x = newX - pos.x;
    vel.current.y = newY - pos.y;
    vel.current.a = newAngle - angle;

    setPos({ x: newX, y: newY });
    setAngle(newAngle);
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`lanyard-wrapper ${className}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        perspective: '1000px',
        paddingTop: '8px',
        ...style,
      }}
    >
      {/* Lanyard Top Strap */}
      <svg
        width="160"
        height="70"
        style={{ overflow: 'visible', pointerEvents: 'none' }}
      >
        <path
          d={`M 80,0 Q ${80 + pos.x * 0.4},${35 + pos.y * 0.4} ${80 + pos.x},${65 + pos.y}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="3.5"
          strokeDasharray="4 2"
        />
        {/* Metal Lanyard Clip */}
        <circle cx={80 + pos.x} cy={65 + pos.y} r="5" fill="#FFFFFF" />
      </svg>

      {/* Hanging ID Card */}
      <div
        onPointerDown={onPointerDown}
        style={{
          width: '240px',
          background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(15, 15, 22, 0.98))',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: isDragging
            ? '0 24px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.25)'
            : '0 12px 32px rgba(0, 0, 0, 0.5)',
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate3d(${pos.x}px, ${pos.y - 12}px, 0) rotate(${angle}deg) rotateY(${pos.x * 0.15}deg)`,
          transformOrigin: 'top center',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          willChange: 'transform',
        }}
      >
        {/* Clip Hole */}
        <div
          style={{
            width: '28px',
            height: '6px',
            background: '#000000',
            borderRadius: '4px',
            margin: '0 auto 12px auto',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={15} color="#FFFFFF" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#FFFFFF' }}>
              NEUROMOVE
            </span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              color: '#10B981',
            }}
          >
            {status}
          </span>
        </div>

        {/* Holographic Chip / Avatar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #38BDF8, #60A5FA, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
            }}
          >
            <Award size={22} color="#000000" />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FFFFFF' }}>{name}</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{id}</div>
          </div>
        </div>

        {/* Card Spec Details */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginBottom: '10px',
          }}
        >
          <div>{affiliation}</div>
          <div style={{ color: '#FFFFFF', fontWeight: 600, marginTop: '2px' }}>
            64-Ch · 109 Subjects · Zero Leakage
          </div>
        </div>

        {/* Footer Barcode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '14px' }}>
            {[4, 2, 5, 2, 6, 3, 2, 5, 3, 4, 2, 6, 2, 4].map((h, i) => (
              <div
                key={i}
                style={{
                  width: `${(i % 3) + 1}px`,
                  height: `${h * 2.2}px`,
                  background: 'rgba(255, 255, 255, 0.65)',
                }}
              />
            ))}
          </div>
          <ShieldCheck size={14} color="#10B981" />
        </div>
      </div>
    </div>
  );
}
