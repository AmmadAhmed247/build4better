import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-nastaliq-urdu/400.css'
import '@fontsource/noto-nastaliq-urdu/700.css'
import './index.css'
import './pay.css'
import './tailwind.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
