"use client";
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, Volume2, VolumeX, Activity, Zap } from "lucide-react";

export interface AudioSyncHandle {
  getFrequencyData: () => Uint8Array | null;
  getAmplitude: () => number;
  isActive: boolean;
}

interface AudioSyncProps {
  onAmplitudeChange?: (amp: number) => void;
  onFrequencyData?: (data: Uint8Array) => void;
  className?: string;
}

const FFT_SIZE = 256;

export const AudioSync = forwardRef<AudioSyncHandle, AudioSyncProps>(function AudioSync(
  { onAmplitudeChange, onFrequencyData, className = "" },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const freqDataRef = useRef<Uint8Array>(new Uint8Array(FFT_SIZE / 2));
  const amplitudeRef = useRef(0);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peakAmplitude, setPeakAmplitude] = useState(0);
  const peakTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useImperativeHandle(ref, () => ({
    getFrequencyData: () => active ? freqDataRef.current : null,
    getAmplitude: () => amplitudeRef.current,
    isActive: active,
  }));

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    analyser.getByteFrequencyData(freqDataRef.current);
    const data = freqDataRef.current;

    // Calculate amplitude
    const amp = data.reduce((s, v) => s + v, 0) / data.length / 255;
    amplitudeRef.current = amp;
    onAmplitudeChange?.(amp);
    onFrequencyData?.(data);

    if (amp > peakAmplitude) {
      setPeakAmplitude(amp);
      clearTimeout(peakTimeoutRef.current);
      peakTimeoutRef.current = setTimeout(() => setPeakAmplitude(0), 2000);
    }

    // Clear
    ctx.clearRect(0, 0, W, H);

    const barW = W / data.length * 2.5;
    const gap = 1.5;

    data.forEach((val, i) => {
      const norm = val / 255;
      const x = i * (barW + gap);
      const barH = norm * H * 0.9;

      // Color based on frequency band
      const hue = 260 + (i / data.length) * 80;
      const saturation = 70 + norm * 30;
      const lightness = 40 + norm * 40;
      const alpha = 0.3 + norm * 0.7;

      // Glow effect for high amplitude bars
      if (norm > 0.6) {
        ctx.shadowBlur = 8 + norm * 16;
        ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
      } else {
        ctx.shadowBlur = 0;
      }

      const gradient = ctx.createLinearGradient(x, H, x, H - barH);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness - 15}%, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
      gradient.addColorStop(1, `hsla(${hue + 20}, 100%, 80%, ${alpha * 0.8})`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, H - barH, barW, barH, [2, 2, 0, 0]);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    animFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [onAmplitudeChange, onFrequencyData, peakAmplitude]);

  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      setActive(true);
      setError(null);
      drawVisualizer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setError(msg);
    }
  }, [drawVisualizer]);

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    sourceRef.current?.disconnect();
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    amplitudeRef.current = 0;
    setActive(false);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioCtxRef.current) return;
    if (muted) {
      audioCtxRef.current.resume();
    } else {
      audioCtxRef.current.suspend();
    }
    setMuted(m => !m);
  }, [muted]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={active ? stopAudio : startAudio}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              active
                ? "bg-red-900/40 border border-red-500/50 text-red-300 hover:bg-red-900/60"
                : "bg-purple-900/40 border border-purple-500/50 text-purple-300 hover:bg-purple-900/60"
            }`}
            style={{
              boxShadow: active ? "0 0 12px rgba(239,68,68,0.3)" : "0 0 12px rgba(168,85,247,0.2)",
            }}
          >
            {active ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {active ? "STOP FFT" : "START FFT"}
          </motion.button>

          {active && (
            <button
              onClick={toggleMute}
              className="p-1.5 rounded text-white/50 hover:text-white/80 transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {active && (
            <>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-400">
                  AMP: {(amplitudeRef.current * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-[10px] font-mono text-purple-400">FFT LIVE</span>
              </div>
            </>
          )}
          {!active && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] font-mono text-white/30">FFT OFFLINE</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[10px] font-mono text-yellow-400 bg-yellow-900/20 border border-yellow-500/20 rounded px-3 py-2"
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform Canvas */}
      <div
        className="relative rounded-xl overflow-hidden border border-purple-500/20"
        style={{ background: "rgba(5,0,20,0.9)", height: 80 }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-full"
          style={{ display: "block" }}
        />

        {/* Peak indicator */}
        {peakAmplitude > 0.5 && (
          <motion.div
            className="absolute top-1 right-2 text-[9px] font-mono text-yellow-400"
            animate={{ opacity: [1, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            PEAK {(peakAmplitude * 100).toFixed(0)}%
          </motion.div>
        )}

        {!active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-mono text-white/20 tracking-widest">
              AUDIO FFT ANALYZER — OFFLINE
            </span>
          </div>
        )}
      </div>

      {/* Frequency band labels */}
      {active && (
        <div className="flex justify-between px-1 text-[9px] font-mono text-white/20">
          <span>20Hz</span>
          <span>200Hz</span>
          <span>2kHz</span>
          <span>20kHz</span>
        </div>
      )}
    </div>
  );
});

export default AudioSync;
