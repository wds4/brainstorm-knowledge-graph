import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'App 2 Home',
    to: '/app2',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Features',
  },
  {
    component: CNavItem,
    name: 'Feature A',
    to: '/app2/featureA',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Feature B',
    to: '/app2/featureB',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'About',
  },
  {
    component: CNavItem,
    name: 'About',
    to: '/app2/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
