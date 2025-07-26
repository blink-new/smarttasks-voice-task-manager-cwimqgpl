import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppContent } from './components/AppContent'

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App