import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  // 1. Initialize state based on localStorage or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 2. This runs whenever the 'theme' state changes
  useEffect(() => {
    const root = document.documentElement; // This is the <html> tag
    
    if (theme === 'dark') {
      root.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]); // Dependency array: only re-run if 'theme' changes

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle-btn">
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;