import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

import { useNostrHooks, useLogin, useAutoLogin } from 'nostr-hooks'
import NDK from '@nostr-dev-kit/ndk'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/login/Login'))

const customNDK = new NDK({
  /* ... */
});

const App = () => {
  useNostrHooks(customNDK)
  console.log('RENDERING TOP LEVEL APP COMPONENT')
  const { loginFromLocalStorage } = useLogin()
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  // useAutoLogin and loginFromLocalStorage seem to do the same thing (? ...)
  useAutoLogin()
  useEffect(() => {
    // loginFromLocalStorage({})
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
