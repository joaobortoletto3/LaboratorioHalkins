"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Efeitos sonoros ORIGINAIS sintetizados com Web Audio (nenhum arquivo externo).
 * Desativados por padrão (SOM ON/OFF).
 */
const KEY = "hawkins_sound";
const EVENT = "hawkins-sound-change";

export type SoundKind = "beep" | "success" | "error" | "alarm" | "door" | "static" | "rift" | "thunder";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.05, delay = 0) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, a.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + delay + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + delay);
  o.stop(a.currentTime + delay + dur + 0.02);
}

function noise(dur: number, gain = 0.03, lowpass?: number) {
  const a = audio();
  if (!a) return;
  const buffer = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = gain;
  src.buffer = buffer;
  if (lowpass) {
    const filter = a.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    src.connect(filter).connect(g).connect(a.destination);
  } else src.connect(g).connect(a.destination);
  src.start();
}

export function playSound(kind: SoundKind) {
  if (typeof window === "undefined" || localStorage.getItem(KEY) !== "on") return;
  void audio()?.resume();
  switch (kind) {
    case "beep":
      tone(880, 0.08, "square", 0.03);
      break;
    case "success":
      tone(523, 0.12, "triangle", 0.05);
      tone(784, 0.18, "triangle", 0.05, 0.12);
      break;
    case "error":
      tone(160, 0.25, "sawtooth", 0.04);
      break;
    case "alarm":
      tone(620, 0.25, "sawtooth", 0.03);
      tone(440, 0.25, "sawtooth", 0.03, 0.27);
      tone(620, 0.25, "sawtooth", 0.03, 0.54);
      break;
    case "door":
      tone(90, 0.6, "sine", 0.08);
      noise(0.4, 0.02);
      break;
    case "static":
      noise(0.5, 0.025);
      break;
    case "rift":
      tone(42, 2.6, "sine", 0.09);
      tone(63, 2.0, "triangle", 0.035, 0.2);
      noise(1.8, 0.06, 420);
      break;
    case "thunder":
      noise(1.6, 0.1, 650);
      tone(36, 1.8, "sine", 0.1);
      break;
  }
}

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem(KEY) === "on");
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const toggle = useCallback(() => {
    const next = localStorage.getItem(KEY) === "on" ? "off" : "on";
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVENT));
    if (next === "on") {
      void audio()?.resume();
      playSound("beep");
    }
  }, []);
  return { enabled, toggle, play: playSound };
}
