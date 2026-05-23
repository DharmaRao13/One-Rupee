import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type SoundName = "click" | "success" | "level_up" | "error" | "coin" | "whoosh";
interface SoundCtx { muted: boolean; toggle: () => void; play: (n: SoundName) => void; }

const Ctx = createContext<SoundCtx>({ muted: true, toggle: () => {}, play: () => {} });

const STORAGE_KEY = "wof_muted";

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [muted, setMuted] = useState(true);
  const acRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "false") setMuted(false);
  }, []);

  const ctx = () => {
    if (!acRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      acRef.current = new AC();
    }
    return acRef.current!;
  };

  const tone = useCallback((freq: number, dur: number, type: OscillatorType = "sine", vol = 0.18, delay = 0) => {
    if (muted) return;
    const ac = ctx();
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }, [muted]);

  const play = useCallback((n: SoundName) => {
    if (muted) return;
    switch (n) {
      case "click":    tone(680, 0.06, "square", 0.10); break;
      case "success":  tone(660, 0.10, "triangle"); tone(990, 0.18, "triangle", 0.18, 0.08); break;
      case "coin":     tone(880, 0.06, "square"); tone(1320, 0.10, "square", 0.16, 0.05); break;
      case "error":    tone(220, 0.18, "sawtooth", 0.15); tone(180, 0.22, "sawtooth", 0.12, 0.08); break;
      case "whoosh":   tone(380, 0.20, "sine", 0.10); break;
      case "level_up":
        [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.20, i * 0.09));
        break;
    }
  }, [muted, tone]);

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (!next) {
        // resume on first unmute (browser policy)
        try { ctx().resume(); } catch { /* noop */ }
      }
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ muted, toggle, play }}>{children}</Ctx.Provider>;
};

export const useSound = () => useContext(Ctx);
