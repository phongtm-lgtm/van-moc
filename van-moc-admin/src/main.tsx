import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import App from './App'
import './index.css'
import './admin.css'
createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider><ToastProvider><BrowserRouter><App /></BrowserRouter></ToastProvider></ThemeProvider></StrictMode>)
