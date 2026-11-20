import '@fontsource-variable/inter'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { PathContext } from './components/nav'
import { findRoute, routes } from './routes'
import { PageDataContext, readPageData } from './pageData'

const route = findRoute(location.pathname) ?? routes[0]
const el = document.getElementById('root')!
const app = (
  <StrictMode>
    <PathContext.Provider value={route.path}>
      <PageDataContext.Provider value={readPageData()}>
        <route.element />
      </PageDataContext.Provider>
    </PathContext.Provider>
  </StrictMode>
)
if (el.firstElementChild) hydrateRoot(el, app)
else createRoot(el).render(app)
