/**
 * @file fx.js
 * @description 8-Bit Web Audio sound synthesizer and celebratory confetti particles.
 */

let audioCtx = null;

/**
 * Plays an 8-bit Minecraft-style sound effect using Web Audio API.
 * @param {'click' | 'success'} type - The sound effect type to play.
 */
export function playSound(type) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;

    if (type === "click") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === "success") {
      const melody = [
        { f: 523.25, t: 0.00 }, // C5
        { f: 659.25, t: 0.09 }, // E5
        { f: 783.99, t: 0.18 }, // G5
        { f: 1046.50, t: 0.27 } // C6
      ];
      melody.forEach((item) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.type = "square";
        noteOsc.frequency.setValueAtTime(item.f, now + item.t);
        noteGain.gain.setValueAtTime(0.15, now + item.t);
        noteGain.gain.linearRampToValueAtTime(0.01, now + item.t + 0.12);
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.start(now + item.t);
        noteOsc.stop(now + item.t + 0.12);
      });
    }
  } catch (e) {
    // Silent fallback if autoplay policy prevents audio
  }
}

let particles = [];
let animationFrameId = null;

/**
 * Launches celebratory square Minecraft confetti particles across the screen.
 */
export function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  particles = [];

  const colors = ["#2ecc71", "#5da632", "#fecb00", "#4deeea", "#ffffff"];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: window.innerWidth * Math.random(),
      y: -20 - Math.random() * 50,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 5,
      size: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6
    });
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.y < canvas.height + 20) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      animationFrameId = requestAnimationFrame(updateParticles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateParticles();
}
