import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('app-mode') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    
    // Remove old classes if they exist
    root.classList.remove('light', 'dark')
    root.classList.remove('theme-indigo', 'theme-emerald', 'theme-slate')
    
    // Add the new mode class
    root.classList.add(mode)
    
    // Save to localStorage
    localStorage.setItem('app-mode', mode)
  }, [mode])

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
