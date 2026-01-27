import React from 'react'

// Dashboard
const ObjectOrientedLists = React.lazy(() => import('src/views/objectOrientedLists/index'))

// About
const About = React.lazy(() => import('src/views/objectOrientedLists/about/index'))

// Features

const List = React.lazy(() => import('src/views/objectOrientedLists/list/index'))
const ViewHeader = React.lazy(() => import('src/views/objectOrientedLists/list/viewHeader/index'))

const routes = [
  { path: '/objectOrientedLists', name: 'Object Oriented Lists', element: ObjectOrientedLists },
  { path: '/objectOrientedLists/about', name: 'About', element: About },
  { path: '/objectOrientedLists/list/viewHeader', name: 'List Header', element: ViewHeader },
  { path: '/objectOrientedLists/list', name: 'List', element: List },
]

export default routes
