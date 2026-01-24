import React from 'react'

// Dashboard
const App2 = React.lazy(() => import('src/views/app2/index'))

// About
const About = React.lazy(() => import('src/views/app2/about/index'))

// Features
const FeatureA = React.lazy(() => import('src/views/app2/featureA/index'))
const FeatureB = React.lazy(() => import('src/views/app2/featureB/index'))

const routes = [
  { path: '/app2', name: 'App 2', element: App2 },
  { path: '/app2/about', name: 'About', element: About },
  { path: '/app2/featureA', name: 'Feature A', element: FeatureA },
  { path: '/app2/featureB', name: 'Feature B', element: FeatureB },
]

export default routes
