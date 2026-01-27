import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Simple List Home',
    to: '/simpleLists',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'This List Home',
    to: '/simpleLists/list/viewHeader',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Curation Home',
    to: '/simpleLists/list/curation',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Curation',
  },
  {
    component: CNavItem,
    name: 'View Trusted List',
    to: '/simpleLists/list/curation/viewTrustedLists',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Publish Trusted List',
    to: '/simpleLists/list/curation/exportTrustedList',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'View Curation',
    to: '/simpleLists/list/curation/viewCuration',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Edit Curation',
    to: '/simpleLists/list/curation/editCuration',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
]

export default _nav
