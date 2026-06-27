import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { isDemoMode, initMockBackend } from './mock/index'

// Bootstrap mock backend before the app renders (no-op when VITE_DEMO_MODE != 'true')
if (isDemoMode()) {
  initMockBackend();
}

createRoot(document.getElementById("root")!).render(<App />);
