import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

if (window.Capacitor?.isNativePlatform?.()) {
  document.addEventListener('deviceready', renderApp, false)
} else {
  renderApp()
}
