import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// System dark mode listener — syncs 'dark' class on <html> with OS preference
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const applySystemTheme = (e) => {
  document.documentElement.classList.toggle('dark', e.matches);
};
applySystemTheme(darkModeQuery);
darkModeQuery.addEventListener('change', applySystemTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)