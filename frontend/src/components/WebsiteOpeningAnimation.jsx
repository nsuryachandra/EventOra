import React, { useState, useEffect, useRef } from 'react';

export const WebsiteOpeningAnimation = ({ onComplete }) => {
  // 0: ambient, 1: accelerating hold, 2: tap hyper-warp surge, 3: flash dissolve, 4: done
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const isAcceleratingRef = useRef(false);

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const speedRef = useRef(1.0);
  const targetSpeedRef = useRef(1.0);
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  const mouseCoords = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400 });

  // Web Audio API engine for ambient warp hum & celestial chimes
  const audioCtxRef = useRef(null);
  const warpOscRef = useRef(null);
  const warpGainRef = useRef(null);

  const updateStage = (newStage) => {
    stageRef.current = newStage;
    setStage(newStage);
  };

  const initAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      audioCtxRef.current = ctx;

      // Low warp engine drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.022, ctx.currentTime + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      warpOscRef.current = osc;
      warpGainRef.current = gain;

      // Initial celestial chime chords
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'triangle';
        chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.2 + idx * 0.14);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start(ctx.currentTime + idx * 0.14);
        chimeOsc.stop(ctx.currentTime + 2.6);
      });
    } catch {
      // Audio autoplay gracefully handled
    }
  };

  // Adjust audio pitch smoothly during acceleration
  useEffect(() => {
    if (!audioCtxRef.current || !warpOscRef.current || !warpGainRef.current) return;
    if (stageRef.current >= 2) return;
    const ctx = audioCtxRef.current;
    if (isAccelerating) {
      warpOscRef.current.frequency.cancelScheduledValues(ctx.currentTime);
      warpOscRef.current.frequency.linearRampToValueAtTime(155, ctx.currentTime + 0.45);
      warpGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      warpGainRef.current.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.45);
    } else {
      warpOscRef.current.frequency.cancelScheduledValues(ctx.currentTime);
      warpOscRef.current.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.6);
      warpGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      warpGainRef.current.gain.linearRampToValueAtTime(0.022, ctx.currentTime + 0.6);
    }
  }, [isAccelerating]);

  // Decoupled mouse tilt & fluid ripple updates: zero React re-render overhead
  const handleMouseMove = (e) => {
    if (stageRef.current >= 2) return;
    mouseCoords.current = { x: e.clientX, y: e.clientY };
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetTilt.current = {
      x: Math.max(-7, Math.min(7, -((e.clientY - cy) / cy) * 5.5)),
      y: Math.max(-7, Math.min(7, ((e.clientX - cx) / cx) * 5.5)),
    };
  };

  const startAcceleration = () => {
    if (stageRef.current >= 2) return;
    initAudio();
    setIsAccelerating(true);
    isAcceleratingRef.current = true;
    targetSpeedRef.current = 4.2;
  };

  const stopAcceleration = () => {
    if (stageRef.current >= 2) return;
    setIsAccelerating(false);
    isAcceleratingRef.current = false;
    targetSpeedRef.current = 1.0;
  };

  // Cinematic Hyper-Speed Warp Jump on Tap / Click (Silky smooth acceleration & dissolve)
  const handleWarpJump = () => {
    if (stageRef.current >= 2) return;
    updateStage(2);

    initAudio();

    if (audioCtxRef.current && warpOscRef.current && warpGainRef.current) {
      try {
        const ctx = audioCtxRef.current;
        warpOscRef.current.frequency.cancelScheduledValues(ctx.currentTime);
        warpOscRef.current.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.65);
        warpGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        warpGainRef.current.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
        warpGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
      } catch {}
    }

    // Accelerate warp speed smoothly
    setIsAccelerating(true);
    isAcceleratingRef.current = true;
    targetSpeedRef.current = 8.5;

    // Gently push scene forward
    if (sceneRef.current) {
      sceneRef.current.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.85s ease-out';
      sceneRef.current.style.transform = 'perspective(1000px) scale(1.16) translateZ(40px)';
    }

    // After 680ms of smooth rush, begin velvety dissolve into light theme
    setTimeout(() => {
      updateStage(3);
      if (containerRef.current) {
        containerRef.current.style.transition = 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), filter 0.65s ease-out';
        containerRef.current.style.opacity = '0';
        containerRef.current.style.filter = 'blur(10px) brightness(1.08)';
      }

      setTimeout(() => {
        updateStage(4);
        if (audioCtxRef.current) {
          try {
            audioCtxRef.current.close();
          } catch {}
        }
        if (onComplete) onComplete();
      }, 620);
    }, 680);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        startAcceleration();
      }
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleWarpJump();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        stopAcceleration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 60FPS / 120FPS Arena Stage Beams: Cinematic Volumetric Stadium & Keynote Spotlight Sweeps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 7 Volumetric Arena Stage Spotlight Fixtures
    const spotlights = [
      {
        xRatio: 0.06,
        yRatio: 1.02,
        baseAngle: -Math.PI * 0.35,
        sweepRange: 0.26,
        speed: 0.65,
        phase: 0.0,
        colorCore: 'rgba(5, 150, 105',     // Emerald Green
        colorGlow: 'rgba(16, 185, 129',
        isFollow: false,
      },
      {
        xRatio: 0.22,
        yRatio: 1.02,
        baseAngle: -Math.PI * 0.40,
        sweepRange: 0.30,
        speed: 0.78,
        phase: 1.8,
        colorCore: 'rgba(13, 148, 136',    // Deep Teal / Cyan
        colorGlow: 'rgba(6, 182, 212',
        isFollow: false,
      },
      {
        xRatio: 0.38,
        yRatio: 1.03,
        baseAngle: -Math.PI * 0.46,
        sweepRange: 0.34,
        speed: 0.58,
        phase: 3.4,
        colorCore: 'rgba(217, 119, 6',     // Warm Amber Gold
        colorGlow: 'rgba(245, 158, 11',
        isFollow: true,                     // Interactive Follow-Spotlight
      },
      {
        xRatio: 0.50,
        yRatio: 1.04,
        baseAngle: -Math.PI * 0.50,
        sweepRange: 0.22,
        speed: 0.48,
        phase: 5.2,
        colorCore: 'rgba(79, 70, 229',     // Royal Indigo Sky Cannon
        colorGlow: 'rgba(99, 102, 241',
        isFollow: false,
      },
      {
        xRatio: 0.62,
        yRatio: 1.03,
        baseAngle: -Math.PI * 0.54,
        sweepRange: 0.34,
        speed: 0.60,
        phase: 0.9,
        colorCore: 'rgba(234, 88, 12',     // Sunburst Tangerine
        colorGlow: 'rgba(251, 191, 36',
        isFollow: true,                     // Interactive Follow-Spotlight
      },
      {
        xRatio: 0.78,
        yRatio: 1.02,
        baseAngle: -Math.PI * 0.60,
        sweepRange: 0.30,
        speed: 0.72,
        phase: 4.5,
        colorCore: 'rgba(16, 185, 129',    // Radiant Mint
        colorGlow: 'rgba(52, 211, 153',
        isFollow: false,
      },
      {
        xRatio: 0.94,
        yRatio: 1.02,
        baseAngle: -Math.PI * 0.65,
        sweepRange: 0.26,
        speed: 0.68,
        phase: 2.6,
        colorCore: 'rgba(217, 119, 6',     // Amber Gold
        colorGlow: 'rgba(245, 158, 11',
        isFollow: false,
      },
    ];

    // Atmospheric Arena Stage Dust / Mist Motes
    const MOTE_COUNT = 55;
    const motes = [];
    for (let i = 0; i < MOTE_COUNT; i++) {
      motes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.8 + 1.2,
        speedY: Math.random() * 0.4 + 0.15,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.8 + 0.4,
        baseAlpha: Math.random() * 0.4 + 0.2,
      });
    }

    let lastTime = performance.now();
    let globalTime = 0;
    const smoothedFollowAngle = { left: -Math.PI * 0.46, right: -Math.PI * 0.54 };

    const render = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;
      const timeScale = dt * 60;

      const isHyperJump = stageRef.current === 2;
      const lerpFactor = isHyperJump ? 0.07 : 0.045;
      speedRef.current += (targetSpeedRef.current - speedRef.current) * (1 - Math.exp(-lerpFactor * timeScale * 4));
      const currentSpeed = speedRef.current;

      globalTime += dt * currentSpeed;

      // 3D Camera Tilt
      if (sceneRef.current && stageRef.current < 2) {
        currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * (1 - Math.exp(-0.06 * timeScale * 3.5));
        currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * (1 - Math.exp(-0.06 * timeScale * 3.5));
        sceneRef.current.style.transform = `perspective(1000px) rotateX(${currentTilt.current.x.toFixed(2)}deg) rotateY(${currentTilt.current.y.toFixed(2)}deg) scale(${isAcceleratingRef.current ? 1.025 : 1})`;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const mouse = mouseCoords.current;
      const stageCenter = { x: w / 2, y: h * 0.40 };

      // 1. Draw Volumetric Arena Stage Spotlight Beams (Light Luxury Theme)
      ctx.globalCompositeOperation = 'source-over';

      for (let i = 0; i < spotlights.length; i++) {
        const spot = spotlights[i];
        const origX = w * spot.xRatio;
        const origY = h * spot.yRatio;

        let theta;
        if (isHyperJump || isAcceleratingRef.current) {
          // Grand Keynote Convergence: All beams pivot directly to the center emblem
          const targetAngle = Math.atan2(stageCenter.y - origY, stageCenter.x - origX);
          theta = targetAngle + Math.sin(globalTime * 3.5 + spot.phase) * 0.04;
        } else if (spot.isFollow) {
          // Interactive follow-spotlight smoothly tracking cursor
          const targetAngle = Math.atan2(mouse.y - origY, mouse.x - origX);
          const key = i < 4 ? 'left' : 'right';
          smoothedFollowAngle[key] += (targetAngle - smoothedFollowAngle[key]) * 0.06;
          theta = smoothedFollowAngle[key] + Math.sin(globalTime * spot.speed + spot.phase) * 0.08;
        } else {
          // Autonomous sweeping arena spotlight
          theta = spot.baseAngle + Math.sin(globalTime * spot.speed + spot.phase) * spot.sweepRange;
        }

        // Beam geometry: expanding volumetric cone
        const beamLength = Math.max(w, h) * 1.5;
        const endCenterX = origX + Math.cos(theta) * beamLength;
        const endCenterY = origY + Math.sin(theta) * beamLength;

        // Perpendicular vector for cone width
        const perpX = -Math.sin(theta);
        const perpY = Math.cos(theta);

        const baseHalfW = 10;
        const headHalfW = (isHyperJump ? 380 : isAcceleratingRef.current ? 310 : 230);

        const p1x = origX - perpX * baseHalfW;
        const p1y = origY - perpY * baseHalfW;
        const p2x = origX + perpX * baseHalfW;
        const p2y = origY + perpY * baseHalfW;
        const p3x = endCenterX + perpX * headHalfW;
        const p3y = endCenterY + perpY * headHalfW;
        const p4x = endCenterX - perpX * headHalfW;
        const p4y = endCenterY - perpY * headHalfW;

        // Draw Volumetric Cone
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.closePath();

        const beamGrad = ctx.createLinearGradient(origX, origY, endCenterX, endCenterY);
        const intensity = isHyperJump ? 1.8 : isAcceleratingRef.current ? 1.35 : 1.0;

        beamGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.9, 0.75 * intensity)})`);
        beamGrad.addColorStop(0.08, `${spot.colorCore}, ${Math.min(0.55, 0.38 * intensity)})`);
        beamGrad.addColorStop(0.35, `${spot.colorCore}, ${Math.min(0.35, 0.20 * intensity)})`);
        beamGrad.addColorStop(0.70, `${spot.colorGlow}, ${Math.min(0.18, 0.08 * intensity)})`);
        beamGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = beamGrad;
        ctx.fill();

        // High-intensity fixture lens flare at stage floor
        const flareRadius = isHyperJump ? 38 : isAcceleratingRef.current ? 28 : 20;
        const flareGrad = ctx.createRadialGradient(origX, origY, 0, origX, origY, flareRadius);
        flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        flareGrad.addColorStop(0.3, `${spot.colorCore}, 0.65)`);
        flareGrad.addColorStop(0.7, `${spot.colorGlow}, 0.25)`);
        flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(origX, origY, flareRadius, 0, Math.PI * 2);
        ctx.fillStyle = flareGrad;
        ctx.fill();
      }

      // 2. Draw Atmospheric Arena Dust & Stage Motes
      for (let j = 0; j < motes.length; j++) {
        const mote = motes[j];
        mote.y -= mote.speedY * (isHyperJump ? 3.5 : 1.0);
        mote.x += Math.sin(globalTime * mote.driftSpeed + mote.driftPhase) * 0.4;

        if (mote.y < -20) {
          mote.y = h + 20;
          mote.x = Math.random() * w;
        }

        const alpha = isHyperJump 
          ? Math.min(0.9, mote.baseAlpha * 1.8) 
          : mote.baseAlpha;

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * (isHyperJump ? 1.4 : 1.0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // 3. Stage Floor Atmospheric Ambient Lighting Wash
      const floorGrad = ctx.createLinearGradient(0, h * 0.78, 0, h);
      floorGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      floorGrad.addColorStop(0.65, isHyperJump ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.08)');
      floorGrad.addColorStop(1.0, isHyperJump ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.12)');

      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (stage === 4) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleWarpJump}
      onMouseMove={handleMouseMove}
      onMouseDown={startAcceleration}
      onMouseUp={stopAcceleration}
      onTouchStart={startAcceleration}
      onTouchEnd={stopAcceleration}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#ffffff',
        background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        perspective: '1200px',
        cursor: stage >= 2 ? 'default' : isAccelerating ? 'grabbing' : 'pointer',
        opacity: 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* Ambient Soft Emerald & Amber Luxury Aura Glow Orbs in background */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '26%',
          width: '540px',
          height: '540px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '25%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* 60FPS / 120FPS Volumetric Spotlight Canvas Layer (Light Theme Engine) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />


      {/* RADIANT HYPERSPACE PORTAL SINGULARITY */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'min(900px, 120vw)',
          height: 'min(900px, 120vw)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(238, 242, 255, 0.6) 30%, rgba(209, 250, 229, 0.35) 60%, transparent 80%)',
          transform: stage >= 2 ? 'translate(-50%, -50%) scale(1.6)' : 'translate(-50%, -50%) scale(0.1)',
          opacity: stage === 2 ? 0.85 : 0,
          filter: 'blur(28px)',
          pointerEvents: 'none',
          zIndex: 6,
          transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* CENTRAL 3D SCENE: OFFICIAL PROJECT LOGO & LUXURY BRAND TYPOGRAPHY */}
      <div
        ref={sceneRef}
        style={{
          position: 'relative',
          zIndex: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '820px',
          width: '100%',
          padding: '20px',
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      >
        {/* BIG PROMINENT 3D 'E' EMBLEM */}
        <div
          style={{
            position: 'relative',
            width: 'min(440px, 80vw)',
            height: 'min(390px, 48vh)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          {/* Intense Radiant Ambient Aura Flare tailored for light theme */}
          <div
            style={{
              position: 'absolute',
              width: 'min(380px, 72vw)',
              height: 'min(380px, 72vw)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(79, 70, 229, 0.22) 40%, rgba(2, 132, 199, 0.12) 65%, transparent 80%)',
              filter: `blur(${stage === 2 ? '46px' : isAccelerating ? '38px' : '28px'})`,
              transform: stage === 2 ? 'scale(1.3)' : isAccelerating ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Ultra-HD Pristine 3D Emblem with Crowd Silhouettes & Gold Ribbon */}
          <img
            src="/logo_transparent.png"
            alt="Eventora Emblem"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              imageRendering: 'high-quality',
              filter: `drop-shadow(0 14px 32px rgba(2, 132, 199, 0.35)) drop-shadow(0 20px 48px rgba(79, 70, 229, 0.28))`,
              transition: 'filter 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>

        {/* ULTRA-MODERN LUXURY BRAND TYPOGRAPHY FOR EVENTORA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(2.3rem, 5vw, 3.6rem)',
              fontWeight: 900,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              lineHeight: 1,
              userSelect: 'none',
              filter: isAccelerating
                ? 'drop-shadow(0 0 28px rgba(14, 165, 233, 0.55)) drop-shadow(0 0 36px rgba(79, 70, 229, 0.45))'
                : 'drop-shadow(0 4px 16px rgba(2, 132, 199, 0.25)) drop-shadow(0 6px 22px rgba(79, 70, 229, 0.20))',
              transition: 'filter 0.3s ease',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 80%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              EVENT
            </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #38bdf8 80%, #7dd3fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ORA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteOpeningAnimation;
