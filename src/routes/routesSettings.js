import React from 'react'

// General Settings
const Settings = React.lazy(() => import('src/views/settings/index'))

// Developer Settings
const Developer = React.lazy(() => import('src/views/settings/developer/index'))

// App Settings
const App1 = React.lazy(() => import('src/views/settings/app1/index'))
const App2 = React.lazy(() => import('src/views/settings/app2/index'))
const App3 = React.lazy(() => import('src/views/settings/app3/index'))

const routes = [
  { path: '/settings', name: 'Settings', element: Settings },
  { path: '/settings/app1', name: 'App 1', element: App1 },
  { path: '/settings/app2', name: 'App 2', element: App2 },
  { path: '/settings/app3', name: 'App 3', element: App3 },
  { path: '/settings/developer', name: 'Developer', element: Developer },
]

export default routes
