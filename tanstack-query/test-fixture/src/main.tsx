import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// anesis:top-imports

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* anesis:providers-start */}
    <App />
    {/* anesis:providers-end */}
  </StrictMode>,
)
