import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Volume2, VolumeX, Radio, Activity,
  Waves, Play, Pause, Square, Zap, Brain,
  Settings2, BarChart2, RefreshCw,
} from "lucide-react";

interface Props {
  onAmplitudeChange?: (amp: number) => void;
}

const NUM_BARS = 48;
const FREQ_LABELS = ["SUB", "BASS", "MID", "HI-MID", "PRES", "AIR"];

export default function VoiceAudioPage({ onAmplitudeChange }: Props) {
  // Stable ref so useCallback deps don't change on every render
  const onAmpRef = useRef(onAmplitudeChange);
  useEffect(() => { onAmpRef.current = onAmplitudeChange; });

  // Voice state
  const [voiceActive, setVoiceActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
  const [voiceError, setVoiceError] = useState("");

  // Audio FFT state
  const [audioActive, setAudioActive] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(NUM_BARS).fill(0));
  const [peakAmplitude, setPeakAmplitude] = useState(0);
  const [avgAmplitude, setAvgAmplitude] = useState(0);
  const [freqBands, setFreqBands] = useState<number[]>(Array(6).fill(0));

  // Waveform for voice
  const [waveform, setWaveform] = useState<number[]>(Array(80).fill(0.05));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      setAudioActive(true);

      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArr);
        const total = dataArr.length;
        const step = Math.floor(total / NUM_BARS);
        const barVals = Array.from({ length: NUM_BARS }, (_, i) => {
          const slice = dataArr.slice(i * step, (i + 1) * step);
          const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
          return avg / 255;
        });
        setBars(barVals);

        const amp = barVals.reduce((s, v) => s + v, 0) / NUM_BARS;
        setPeakAmplitude(prev => Math.max(prev * 0.97, amp));
        setAvgAmplitude(amp);
        onAmpRef.current?.(amp);

        const bw = Math.floor(total / 6);
        setFreqBands(Array.from({ length: 6 }, (_, i) => {
          const slice = dataArr.slice(i * bw, (i + 1) * bw);
          return (slice.reduce((s, v) => s + v, 0) / slice.length) / 255;
        }));

        setWaveform(prev => {
          const next = [...prev.slice(1), amp * 2.5 + 0.03];
          return next;
        });

        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.error("Mic access denied", e);
    }
  }, []); // stable — reads onAmpRef via ref

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    setAudioActive(false);
    setBars(Array(NUM_BARS).fill(0));
    setPeakAmplitude(0);
    setAvgAmplitude(0);
    setFreqBands(Array(6).fill(0));
    setWaveform(Array(80).fill(0.05));
    onAmpRef.current?.(0);
  }, []); // stable — reads onAmpRef via ref

  const toggleAudio = () => audioActive ? stopAudio() : startAudio();

  const startVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError("Speech recognition not supported in this browser.");
      return;
    }
    setVoiceError("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SpeechRec() as any;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(interim || finalText);
      if (finalText) {
        setVoiceHistory(prev => [finalText.trim(), ...prev].slice(0, 8));
        setTranscript("");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => setVoiceError(`Error: ${e.error}`);
    rec.onend = () => { setListening(false); };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setTranscript("");
  }, []);

  const toggleVoice = () => {
    if (voiceActive) {
      stopVoice();
      setVoiceActive(false);
    } else {
      setVoiceActive(true);
      startVoice();
      if (!audioActive) startAudio();
    }
  };

  useEffect(() => () => { stopAudio(); stopVoice(); }, [stopAudio, stopVoice]);

  const getBarColor = (val: number, idx: number) => {
    const hue = 260 + (idx / NUM_BARS) * 80;
    const lightness = 45 + val * 30;
    return `hsl(${hue},90%,${lightness}%)`;
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pb-4">

      {/* ── Top: Voice + Waveform ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Voice Control Panel */}
        <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono tracking-widest text-white/80 flex items-center gap-2">
              <Mic className="w-4 h-4 text-accent" style={{ color: "var(--accent-primary)" }} />
              VOICE INTERFACE
            </h3>
            <div className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border ${listening ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30" : "border-white/10 text-white/30"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
              {listening ? "LISTENING" : "STANDBY"}
            </div>
          </div>

          {/* Big mic button */}
          <div className="flex flex-col items-center py-4 gap-4">
            <motion.button
              onClick={toggleVoice}
              whileTap={{ scale: 0.92 }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all"
              style={{
                background: voiceActive
                  ? `radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 30%, transparent), color-mix(in srgb, var(--accent-primary) 8%, transparent))`
                  : "rgba(255,255,255,0.04)",
                border: `2px solid ${voiceActive ? "var(--accent-primary)" : "rgba(255,255,255,0.12)"}`,
                boxShadow: voiceActive ? `0 0 30px color-mix(in srgb, var(--accent-primary) 40%, transparent), 0 0 60px color-mix(in srgb, var(--accent-primary) 15%, transparent)` : "none",
              }}
            >
              {voiceActive ? (
                <MicOff className="w-8 h-8" style={{ color: "var(--accent-primary)" }} />
              ) : (
                <Mic className="w-8 h-8 text-white/50" />
              )}
              {voiceActive && listening && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid var(--accent-primary)`, opacity: 0.5 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-[11px] font-mono text-white/40">
                {voiceActive ? "Click to stop • Speak to JARVIS" : "Click to activate voice"}
              </p>
              {voiceError && <p className="text-[10px] text-red-400 mt-1">{voiceError}</p>}
            </div>
          </div>

          {/* Live transcript */}
          <div
            className="min-h-[52px] px-3 py-2 rounded-xl text-sm font-mono border transition-all"
            style={{
              background: transcript ? "color-mix(in srgb, var(--accent-primary) 8%, transparent)" : "rgba(0,0,0,0.3)",
              borderColor: transcript ? "color-mix(in srgb, var(--accent-primary) 30%, transparent)" : "rgba(255,255,255,0.08)",
              color: transcript ? "var(--text-primary)" : "rgba(255,255,255,0.2)",
            }}
          >
            {transcript || (voiceActive ? "Waiting for speech..." : "—")}
            {transcript && <motion.span className="inline-block w-1.5 h-4 ml-1 align-middle rounded-sm" style={{ background: "var(--accent-primary)" }} animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />}
          </div>

          {/* History */}
          {voiceHistory.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <p className="text-[9px] font-mono text-white/25 tracking-widest mb-1">TRANSCRIPT HISTORY</p>
              {voiceHistory.map((h, i) => (
                <div key={i} className="text-[11px] font-mono text-white/50 px-2 py-1 rounded bg-white/3 border border-white/5 truncate">
                  <span style={{ color: "var(--accent-secondary)" }}>›</span> {h}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waveform visualizer */}
        <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-mono tracking-widest text-white/80 flex items-center gap-2">
              <Waves className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />
              WAVEFORM
            </h3>
            <div className="text-[10px] font-mono text-white/30">
              AMP: <span style={{ color: "var(--accent-secondary)" }}>{(avgAmplitude * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Waveform */}
          <div className="relative h-24 flex items-center gap-[1px] overflow-hidden rounded-xl bg-black/30 px-2">
            {waveform.map((v, i) => {
              const h = Math.max(2, v * 90);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-none"
                  style={{
                    height: `${h}%`,
                    minWidth: "1px",
                    background: `linear-gradient(to top, var(--accent-primary), var(--accent-secondary))`,
                    opacity: 0.4 + v * 0.6,
                  }}
                />
              );
            })}
            {/* Center line */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all border"
              style={{
                background: audioActive ? "color-mix(in srgb, var(--accent-secondary) 20%, transparent)" : "rgba(255,255,255,0.04)",
                borderColor: audioActive ? "color-mix(in srgb, var(--accent-secondary) 40%, transparent)" : "rgba(255,255,255,0.12)",
                color: audioActive ? "var(--accent-secondary)" : "rgba(255,255,255,0.4)",
              }}
            >
              {audioActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {audioActive ? "Stop Capture" : "Start Capture"}
            </button>
            <div className="flex-1 text-right text-[10px] font-mono text-white/25">
              {audioActive ? "LIVE MIC INPUT" : "NO SIGNAL"}
            </div>
          </div>

          {/* Peak meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-white/30">
              <span>PEAK</span>
              <span style={{ color: peakAmplitude > 0.7 ? "#f87171" : peakAmplitude > 0.4 ? "#fbbf24" : "var(--accent-primary)" }}>
                {(peakAmplitude * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${peakAmplitude * 100}%`,
                  background: peakAmplitude > 0.7 ? "linear-gradient(90deg,#f59e0b,#ef4444)" : `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`,
                }}
                transition={{ duration: 0.05 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: FFT Spectrum ─────────────────────────────── */}
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono tracking-widest text-white/80 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            FFT SPECTRUM ANALYZER
          </h3>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/30">
            <span>256 bins</span>
            <span>44.1 kHz</span>
            <span>~5ms</span>
            <div className={`flex items-center gap-1 ${audioActive ? "text-emerald-400" : "text-white/20"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${audioActive ? "bg-emerald-400 animate-pulse" : "bg-white/15"}`} />
              {audioActive ? "LIVE" : "OFFLINE"}
            </div>
          </div>
        </div>

        {/* FFT Bars */}
        <div className="relative flex-1 flex items-end gap-[2px] min-h-[120px] bg-black/30 rounded-xl px-3 pt-3 pb-2 overflow-hidden">
          {/* Horizontal grid lines */}
          {[25, 50, 75].map(p => (
            <div key={p} className="absolute left-0 right-0 border-t border-white/5" style={{ bottom: `${p}%` }}>
              <span className="absolute right-1 -top-2.5 text-[8px] text-white/15 font-mono">{p}%</span>
            </div>
          ))}

          {bars.map((v, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm min-w-[3px] origin-bottom"
              style={{
                height: `${Math.max(2, v * 100)}%`,
                background: getBarColor(v, i),
                boxShadow: v > 0.5 ? `0 0 6px ${getBarColor(v, i)}` : "none",
              }}
              animate={{ height: `${Math.max(2, v * 100)}%` }}
              transition={{ duration: 0.04 }}
            />
          ))}
        </div>

        {/* Frequency band breakdown */}
        <div className="grid grid-cols-6 gap-2">
          {FREQ_LABELS.map((label, i) => (
            <div key={label} className="text-center">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${freqBands[i] * 100}%`,
                    background: getBarColor(freqBands[i], i * 8),
                  }}
                />
              </div>
              <div className="text-[8px] font-mono text-white/25">{label}</div>
              <div className="text-[9px] font-mono" style={{ color: "var(--accent-secondary)" }}>
                {(freqBands[i] * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
