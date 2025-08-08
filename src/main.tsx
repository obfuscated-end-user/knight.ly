// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
	// without StrictMode, it prevents the double logs in Board.playMove()
	<App />
)

/*

<StrictMode>
	<App />
</StrictMode>,
*/