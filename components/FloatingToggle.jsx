import React from 'react';
import { useTheme } from './ThemeContext';

const FloatingToggle = () => {
  const { theme, togglePopover, isPopoverOpen } = useTheme();

  const getThemeIcon = (themeName) => {
    switch(themeName) {
      case 'desertMinimal':
        return '☀️';
      case 'nightSky':
        return '🌙';
      case 'cyberpunk':
        return '⚡';
      default:
        return '🎨';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={togglePopover}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
        aria-label="Change theme"
      >
        {getThemeIcon(theme)}
      </button>
      
      {isPopoverOpen && (
        <div className="absolute top-16 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl p-2 z-50 w-48">
          <h3 className="text-white text-sm font-medium mb-2 px-2">Select Theme</h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => changeTheme('desertMinimal')}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                theme === 'desertMinimal' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span>☀️</span>
              <span>Desert Minimal</span>
            </button>
            <button
              onClick={() => changeTheme('nightSky')}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                theme === 'nightSky' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span>🌙</span>
              <span>Night Sky</span>
            </button>
            <button
              onClick={() => changeTheme('cyberpunk')}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                theme === 'cyberpunk' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span>⚡</span>
              <span>Cyberpunk</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToggle;@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Default theme (desert minimal) */
  --bg-primary: #f5f0e6;
  --bg-secondary: #fff9f0;
  --text-primary: #3d2f1c;
  --text-secondary: #7a6b54;
  --accent-primary: #d4a76a;
  --accent-secondary: #a8865c;
  --border-color: #e0d0b0;
  --shadow-color: rgba(196, 160, 112, 0.1);
  --button-bg: #e6d4b0;
  --button-hover: #d4a76a;
}

[data-theme="nightSky"] {
  --bg-primary: #0a1128;
  --bg-secondary: #121c3a;
  --text-primary: #e0f0ff;
  --text-secondary: #a0c0e0;
  --accent-primary: #4d9dff;
  --accent-secondary: #6a7de0;
  --border-color: #1a2b50;
  --shadow-color: rgba(26, 43, 80, 0.3);
  --button-bg: #1a2b50;
  --button-hover: #4d9dff;
}

[data-theme="cyberpunk"] {
  --bg-primary: #0a0a14;
  --bg-secondary: #121220;
  --text-primary: #00ffff;
  --text-secondary: #ff00ff;
  --accent-primary: #00ffff;
  --accent-secondary: #ff00ff;
  --border-color: #330066;
  --shadow-color: rgba(0, 255, 255, 0.2);
  --button-bg: #1a0033;
  --button-hover: #00ffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 100vh;
  padding: 0;
  overflow-x: hidden;
}

/* Masterpiece Grid Layout */
.main-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Glassmorphism Panels */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px var(--shadow-color);
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.glass-panel:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px var(--shadow-color);
  background: rgba(255, 255, 255, 0.12);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255import React from 'react';
import { useTheme } from './ThemeContext';

const FloatingToggle = () => {
  const { theme, togglePopover, isPopoverOpen, changeTheme } = useTheme();

  const getThemeIcon = (themeName) => {
    switch(themeName) {
      case 'desertMinimal':
        return '☀️';
      case 'nightSky':
        return '🌙';
      case 'cyberpunk':
        return '⚡';
      default:
        return '🎨';
    }
  };

  const themeIcons = {
    desertMinimal: '☀️',
    nightSky: '🌙',
    cyberpunk: '⚡'
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={togglePopover}
        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
        aria-label="Change theme"
      >
        {getThemeIcon(theme)}
      </button>
      
      {isPopoverOpen && (
        <div className="absolute top-16 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-3 z-50 w-52 animate-fade-in">
          <h3 className="text-white text-sm font-semibold mb-3 px-2 flex items-center gap-2">
            <span>🎨</span>
            <span>Select Theme</span>
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => changeTheme('desertMinimal')}
              className={`px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all duration-300 transform hover:scale-105 ${
                theme === 'desertMinimal' 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">☀️</span>
              <span>Desert Minimal</span>
            </button>
            <button
              onClick={() => changeTheme('nightSky')}
              className={`px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all duration-300 transform hover:scale-105 ${
                theme === 'nightSky' 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">🌙</span>
              <span>Night Sky</span>
            </button>
            <button
              onClick={() => changeTheme('cyberpunk')}
              className={`px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all duration-300 transform hover:scale-105 ${
                theme === 'cyberpunk' 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="text-lg">⚡</span>
              <span>Cyberpunk</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToggle;