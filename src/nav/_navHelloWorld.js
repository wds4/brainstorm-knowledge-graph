import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilClipboard, cilGraph, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Hello World',
    to: '/helloWorld',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'nostr-hooks',
  },
  {
    component: CNavItem,
    name: '1: Subscribe to Events',
    to: '/helloWorld/testPage1',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '2: Active User Profile',
    to: '/helloWorld/testPage2',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '3: Fetch profile',
    to: '/helloWorld/testPage3',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '4: NDK Instance',
    to: '/helloWorld/testPage4',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '5: Publish New Event',
    to: '/helloWorld/testPage5',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'unused',
  },
  {
    component: CNavItem,
    name: 'Test Page 6',
    to: '/helloWorld/testPage6',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 7',
    to: '/helloWorld/testPage7',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 8',
    to: '/helloWorld/testPage8',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 9',
    to: '/helloWorld/testPage9',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 10',
    to: '/helloWorld/testPage10',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 11',
    to: '/helloWorld/testPage11',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 12',
    to: '/helloWorld/testPage12',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 13',
    to: '/helloWorld/testPage13',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 14',
    to: '/helloWorld/testPage14',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 15',
    to: '/helloWorld/testPage15',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 16',
    to: '/helloWorld/testPage16',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 17',
    to: '/helloWorld/testPage17',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 18',
    to: '/helloWorld/testPage18',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 19',
    to: '/helloWorld/testPage19',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Test Page 20',
    to: '/helloWorld/testPage20',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
]

export default _nav
