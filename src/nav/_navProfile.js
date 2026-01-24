import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Profile Home',
    to: '/profile',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Nostr',
  },
  {
    component: CNavItem,
    name: 'Followers',
    to: '/profile/followers',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Follows',
    to: '/profile/follows',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'About',
    to: '/profile/about',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Grapevine',
  },
  {
    component: CNavItem,
    name: 'Scores',
    to: '/profile/scores',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
