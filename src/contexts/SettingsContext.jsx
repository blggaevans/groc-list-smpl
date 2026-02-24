import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
  compactView: false,
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('groc-settings')
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  function updateSetting(key, value) {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      localStorage.setItem('groc-settings', JSON.stringify(next))
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
