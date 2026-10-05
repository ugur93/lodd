/** Tombola bed + SFX. Unlock from a click, then the overlay can play. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let muted = false;
let ambience: { stop: () => void; setEnergy: (n: number) => void } | null = null;
let noiseBuf: AudioBuffer | null = null;
let energyGain: GainNode | null = null;

const MUTE_KEY = "lodd-sound-muted";

export function getDrawMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDrawMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(next ? 0 : 0.7, ctx.currentTime, 0.05);
  }
}

function ensureGraph() {
  if (ctx) return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  musicBus = ctx.createGain();
  sfxBus = ctx.createGain();
  musicBus.gain.value = 0.55;
  sfxBus.gain.value = 0.9;
  muted = getDrawMuted();
  master.gain.value = muted ? 0 : 0.7;
  musicBus.connect(master);
  sfxBus.connect(master);
  master.connect(ctx.destination);
  noiseBuf = makeNoise(ctx, 1.6);
}

function makeNoise(ac: AudioContext, seconds: number) {
  const n = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.93 + white * 0.07;
    data[i] = last * 1.35;
  }
  return buf;
}

export function unlockDrawAudio() {
  if (typeof window === "undefined") return;
  ensureGraph();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ctx?.state === "suspended") {
      void ctx.resume();
    }
  });
}

export function stopDrawAmbience() {
  ambience?.stop();
  ambience = null;
  energyGain = null;
}

export function setSpinEnergy(value: number) {
  if (!ctx || !energyGain) return;
  const v = Math.max(0.05, Math.min(1, value));
  energyGain.gain.setTargetAtTime(v, ctx.currentTime, 0.12);
}

export function startDrawAmbience() {
  stopDrawAmbience();
  ensureGraph();
  if (!ctx || !musicBus || !noiseBuf) return;
  if (ctx.state === "suspended") void ctx.resume();
  const ac = ctx;
  const bus = musicBus;
  const buf = noiseBuf;
  const now = ac.currentTime;

  const energy = ac.createGain();
  energy.gain.value = 1;
  energy.connect(bus);
  energyGain = energy;

  const cage = ac.createBufferSource();
  cage.buffer = buf;
  cage.loop = true;
  const cageLp = ac.createBiquadFilter();
  cageLp.type = "lowpass";
  cageLp.frequency.value = 420;
  cageLp.Q.value = 0.7;
  const cageGain = ac.createGain();
  cageGain.gain.setValueAtTime(0.0001, now);
  cageGain.gain.exponentialRampToValueAtTime(0.22, now + 0.45);
  cage.connect(cageLp);
  cageLp.connect(cageGain);
  cageGain.connect(energy);
  cage.start(now);

  const lfo = ac.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 2.4;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(cageLp.frequency);
  lfo.start(now);

  const drone = ac.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 98;
  const drone2 = ac.createOscillator();
  drone2.type = "sine";
  drone2.frequency.value = 147;
  const droneG = ac.createGain();
  droneG.gain.setValueAtTime(0.0001, now);
  droneG.gain.exponentialRampToValueAtTime(0.07, now + 0.6);
  drone.connect(droneG);
  drone2.connect(droneG);
  droneG.connect(energy);
  drone.start(now);
  drone2.start(now);

  const waltz = [196, 246.94, 293.66, 246.94, 329.63, 246.94, 293.66, 196];
  let step = 0;
  const noteId = window.setInterval(() => {
    if (!ctx || !musicBus) return;
    const t = ctx.currentTime;
    const freq = waltz[step % waltz.length]!;
    step += 1;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.028, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(lp);
    lp.connect(g);
    g.connect(musicBus);
    osc.start(t);
    osc.stop(t + 0.58);
  }, 420);

  let cancelled = false;
  let nextClack = now + 0.12;
  let timer = 0;
  const clack = () => {
    if (cancelled || !ctx) return;
    const t = ctx.currentTime;
    while (nextClack < t + 0.28) {
      const src = ac.createBufferSource();
      src.buffer = buf;
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 700 + Math.random() * 1100;
      bp.Q.value = 1.1;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, nextClack);
      g.gain.exponentialRampToValueAtTime(0.12, nextClack + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, nextClack + 0.05);
      src.connect(bp);
      bp.connect(g);
      g.connect(energy);
      src.start(nextClack);
      src.stop(nextClack + 0.06);
      nextClack += 0.07 + Math.random() * 0.09;
    }
    timer = window.setTimeout(clack, 70);
  };
  clack();

  ambience = {
    setEnergy: (n: number) => {
      energy.gain.setTargetAtTime(Math.max(0.05, Math.min(1, n)), ac.currentTime, 0.1);
    },
    stop: () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearInterval(noteId);
      const t = ac.currentTime;
      cageGain.gain.setTargetAtTime(0.0001, t, 0.08);
      droneG.gain.setTargetAtTime(0.0001, t, 0.08);
      window.setTimeout(() => {
        try {
          cage.stop();
          lfo.stop();
          drone.stop();
          drone2.stop();
        } catch {
          /* already stopped */
        }
        cageGain.disconnect();
        droneG.disconnect();
        energy.disconnect();
      }, 320);
    },
  };
}

export function playTick() {
  if (!ctx || !sfxBus) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 980 + Math.random() * 280;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.045, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);
  osc.connect(g);
  g.connect(sfxBus);
  osc.start(t);
  osc.stop(t + 0.03);
}

export function playClunk() {
  if (!ctx || !sfxBus || !noiseBuf) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(62, t + 0.18);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.32, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  osc.connect(og);
  og.connect(sfxBus);
  osc.start(t);
  osc.stop(t + 0.28);

  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 520;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.2, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  src.connect(lp);
  lp.connect(ng);
  ng.connect(sfxBus);
  src.start(t);
  src.stop(t + 0.18);
}

export function playFanfare() {
  stopDrawAmbience();
  if (!ctx || !sfxBus || !noiseBuf) return;
  const ac = ctx;
  const t = ac.currentTime;
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = i > 2 ? "triangle" : "sine";
    osc.frequency.value = freq;
    const g = ac.createGain();
    const start = t + i * 0.075;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.2, start + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.95);
    osc.connect(g);
    g.connect(sfxBus!);
    osc.start(start);
    osc.stop(start + 1);
  });

  const crash = ac.createBufferSource();
  crash.buffer = noiseBuf;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1600;
  const cg = ac.createGain();
  cg.gain.setValueAtTime(0.14, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  crash.connect(hp);
  hp.connect(cg);
  cg.connect(sfxBus);
  crash.start(t);
  crash.stop(t + 0.55);
}
