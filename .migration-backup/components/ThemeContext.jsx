import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('desertMinimal');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme in localStorage on load
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to the HTML tag so CSS variables work
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    setIsPopoverOpen(false); // Close popover after selection
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme, isPopoverOpen, setIsPopoverOpen }}>
      {children}
    </ThemeContext.Provider>
  );
};