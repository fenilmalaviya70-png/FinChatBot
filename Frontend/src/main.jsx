/**
 * Application Entry Point
 * Sets up React Router and renders the app
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Import pages
import ChatPageNew from './pages/ChatPageNew'
import AboutPage from './pages/AboutPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main chat route */}
        <Route path="/" element={<ChatPageNew />} />
        
        {/* About page route */}
        <Route path="/about" element={<AboutPage />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
