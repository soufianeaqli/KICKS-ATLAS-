import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
const THEME_KEY = 'navbar-theme';

export const ThemeProvider = ({ children }) => {
  const [whiteTheme, setWhiteTheme] = useState(() => localStorage.getItem(THEME_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(THEME_KEY, whiteTheme);
  }, [whiteTheme]);

  const toggleTheme = () => setWhiteTheme(prev => !prev);

  return (
    <ThemeContext.Provider value={{ whiteTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
