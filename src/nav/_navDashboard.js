import React from 'react'
import CIcon from '@coreui/icons-react'
import { cibTwitter, cibWikipedia, cilApps, cilInfo, cilSpeedometer, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'Workspaces',
  },
  {
    component: CNavGroup,
    name: 'Data Models',
    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Simple Lists',
        to: '/simpleLists',
      },
      {
        component: CNavItem,
        name: 'Concepts',
        to: '/concepts',
      },
      {
        component: CNavItem,
        name: 'App 2',
        to: '/app2',
      },
      {
        component: CNavItem,
        name: 'App 3',
        to: '/app3',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'About',
  },
  {
    component: CNavItem,
    name: 'About',
    to: '/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
