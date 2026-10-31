import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-nastaliq-urdu/400.css'
import '@fontsource/noto-nastaliq-urdu/700.css'
import '@fontsource/inter-tight/400.css'
import '@fontsource/inter-tight/500.css'
import '@fontsource/inter-tight/600.css'
import '@fontsource/inter-tight/700.css'
import '@fontsource/inter-tight/800.css'
import '@fontsource/jetbrains-mono/400.css'
import './index.css'
import './pay.css'
import './theme.css'
import './tailwind.css'
import App from './App.jsx'
import Scenery from './components/Scenery'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Scenery />
    <App />
  </StrictMode>,
)
