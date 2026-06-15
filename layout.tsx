import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

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
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Global styles for all components */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
  transition: all 0.3s ease;
}

.button {
  background-color: var(--button-bg);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px var(--shadow-color);
}

.button:hover {
  background-color: var(--button-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }import './globals.css';
import { ThemeProvider } from '../components/ThemeContext';
import FloatingToggle from '../components/FloatingToggle';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <FloatingToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
  
  .card {
    padding: 1rem;
  }
  
  .button {
    padding: 0.6rem 1.2rem;
  }
}
});

export const metadata: Metadata = {
  title: "Create Next App",import React from 'react';
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

export default FloatingToggle;
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
import './globals.css';
import { ThemeProvider } from './components/ThemeContext';
import FloatingToggle from './components/FloatingToggle';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <FloatingToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}