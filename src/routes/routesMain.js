import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('src/views/dashboard/index'))

// About
const About = React.lazy(() => import('src/views/about/index'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/about', name: 'About', element: About },
]

export default routes
