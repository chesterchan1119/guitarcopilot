import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import TunerTab from './components/TunerTab.jsx';   // adjust path if different
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="app-container">
      <App />
    </div>
  </React.StrictMode>,
)