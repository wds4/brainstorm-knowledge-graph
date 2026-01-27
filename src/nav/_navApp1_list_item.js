import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Simple List Home',
    to: '/simpleLists/list',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'List Item',
  },
  {
    component: CNavItem,
    name: 'View Item',
    to: '/simpleLists/list/items/item/viewItem',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'View Curation',
    to: '/simpleLists/list/items/item/viewCuration',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Edit Item',
    to: '/simpleLists/list/items/item/editItem',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
]

export default _nav
