import React from 'react'

// Dashboard
const App3 = React.lazy(() => import('src/views/app3/index'))

// About
const About = React.lazy(() => import('src/views/app3/about/index'))

// Features
const FeatureA = React.lazy(() => import('src/views/app3/featureA/index'))
const FeatureB = React.lazy(() => import('src/views/app3/featureB/index'))

const routes = [
  { path: '/app3', name: 'App 3', element: App3 },
  { path: '/app3/about', name: 'About', element: About },
  { path: '/app3/featureA', name: 'Feature A', element: FeatureA },
  { path: '/app3/featureB', name: 'Feature B', element: FeatureB },
]

export default routes
