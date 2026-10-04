import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-condensed/latin-800.css'
import '@fontsource/bangers/latin-400.css'
import '@fontsource/orbitron/latin-700.css'
import '@fontsource/orbitron/latin-900.css'
import '@fontsource/permanent-marker/latin-400.css'
import '@fontsource/caveat/latin-700.css'
import '@fontsource/press-start-2p/latin-400.css'
import '@fontsource/playfair-display/latin-800.css'
import '@fontsource/playfair-display/latin-900.css'
import { registerSW } from 'virtual:pwa-register'

// Recharge automatiquement quand une nouvelle version est déployée,
// et revérifie à chaque retour dans l'app (sinon la PWA installée garde l'ancienne)
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
