import React from 'react'

// Dashboard
const App1 = React.lazy(() => import('src/views/app1/index'))

// About
const About = React.lazy(() => import('src/views/app1/about/index'))

// Features
const FeatureA = React.lazy(() => import('src/views/app1/featureA/index'))
const FeatureB = React.lazy(() => import('src/views/app1/featureB/index'))

const routes = [
  { path: '/app1', name: 'App 1', element: App1 },
  { path: '/app1/about', name: 'About', element: About },
  { path: '/app1/featureA', name: 'Feature A', element: FeatureA },
  { path: '/app1/featureB', name: 'Feature B', element: FeatureB },
]

export default routes
