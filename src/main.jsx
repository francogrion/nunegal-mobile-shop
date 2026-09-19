import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Location updates must be urgent, not transitions: the search box reads
        its value from the URL, and deferred updates made it drop characters
        when typing fast. The app does not rely on Suspense transitions. */}
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
