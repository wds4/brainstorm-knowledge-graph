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
    name: 'Decentralized List',
  },
  {
    component: CNavItem,
    name: 'View List Header',
    to: '/simpleLists/list/viewHeader',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Edit List Header',
    to: '/simpleLists/list/editHeader',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'View List Items (table)',
    to: '/simpleLists/list/items',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Explore List Item',
    to: '/simpleLists/list/items/item',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'View Item',
        to: '/simpleLists/list/items/item/viewItem',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Edit Item',
        to: '/simpleLists/list/items/item/editItem',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
    ]
  },
  {
    component: CNavItem,
    name: 'Make New Item',
    to: '/simpleLists/list/createItem',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Curation',
    to: '/simpleLists/list/curation',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
    items: [
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
      {
        component: CNavItem,
        name: 'Export Trusted List',
        to: '/simpleLists/list/curation/exportTrustedList',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
    ]
  },
]

export default _nav
