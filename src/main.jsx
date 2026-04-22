import { MiniKit } from '@worldcoin/minikit-js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 🔥 Inicializar MiniKit
MiniKit.install()

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
