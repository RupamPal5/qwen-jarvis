import React, { useState, useEffect } from 'react';
import { TailwindProvider } from 'tailwindcss-react';

const GlassPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="glass-panel">
      {children}
    </div>
  );
};

const FFTVisualizer: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);

        const barWidth = (width / audioData.length) * 2;
        let x = 0;

        for (let i = 0; i < audioData.length; i++) {
          const barHeight = audioData[i] * 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        requestAnimationFrame(draw);
      }

      draw();
    }
  }, [audioData]);

  return (
    <canvas ref={canvasRef} width="600" height="200"></canvas>
  );
};

const CriticalActionModal: React.FC<{ isOpen: boolean, onClose: () => void, onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <h2>Confirm Action</h2>
        <p>This action is critical. Are you sure?</p>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onClose}>No</button>
      </div>
    </div>
  );
};

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'cyberpunk' | 'night' | 'morning' | 'winter' | 'desert'>('cyberpunk');

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="cyberpunk">Cyberpunk</option>
      <option value="night">Night Sky</option>
      <option value="morning">Morning Sky</option>
      <option value="winter">Winter</option>
      <option value="desert">Desert</option>
    </select>
  );
};

const GlassmorphicUI: React.FC = () => {
  const [audioData, setAudioData] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Simulate WebSocket audio data
    const interval = setInterval(() => {
      setAudioData(prev => [...prev, Math.random() * 100]);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <TailwindProvider>
      <div className="glassmorphic-ui">
        <GlassPanel>
          <h1>Glassmorphic UI</h1>
          <FFTVisualizer audioData={audioData} />
        </GlassPanel>
        <CriticalActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={() => setModalOpen(false)} />
        <ThemeSwitcher />
      </div>
    </TailwindProvider>
  );
};

export default GlassmorphicUI;
