import '@fontsource-variable/inter'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { findRoute, routes } from './routes'

const route = findRoute(location.pathname) ?? routes[0]
const el = document.getElementById('root')!
const app = (
  <StrictMode>
    <route.element />
  </StrictMode>
)
if (el.firstElementChild) hydrateRoot(el, app)
else createRoot(el).render(app)
