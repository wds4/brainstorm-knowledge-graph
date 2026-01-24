import React from 'react'
import CIcon from '@coreui/icons-react'
import { cibTwitter, cibWikipedia, cilApps, cilInfo, cilSpeedometer, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavTitle,
    name: 'About',
  },
  {
    component: CNavItem,
    name: 'About PGFT NRD',
    to: '/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Apps',
  },
  {
    component: CNavGroup,
    name: 'Apps',
    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'App 1',
        to: '/app1',
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
]

export default _nav
