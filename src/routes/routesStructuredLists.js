import React from 'react'

// Dashboard
const StructuredLists = React.lazy(() => import('src/views/structuredLists/index'))

// About
const About = React.lazy(() => import('src/views/structuredLists/about/index'))

// Features

const List = React.lazy(() => import('src/views/structuredLists/list/index'))
const ViewHeader = React.lazy(() => import('src/views/structuredLists/list/viewHeader/index'))

const routes = [
  { path: '/structuredLists', name: 'Structured Lists', element: StructuredLists },
  { path: '/structuredLists/about', name: 'About', element: About },
  { path: '/structuredLists/list/viewHeader', name: 'List Header', element: ViewHeader },
  { path: '/structuredLists/list', name: 'List', element: List },
]

export default routes
