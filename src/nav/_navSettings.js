import React from 'react'
import CIcon from '@coreui/icons-react'
import { cibTwitter, cilGraph, cilPencil, cilSettings, cilSpeedometer, cilThumbUp } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'General Settings',
    to: '/settings',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Apps',
  },
  {
    component: CNavItem,
    name: 'App1 Settings',
    to: '/settings/app1',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'App2 Settings',
    to: '/settings/app2',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'App3 Settings',
    to: '/settings/app3',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Technical',
  },
  {
    component: CNavItem,
    name: 'Developer',
    to: '/settings/developer',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
