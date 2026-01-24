import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Simple List Home',
    to: '/app1/list',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Decentralized List',
  },
  {
    component: CNavItem,
    name: 'View List Header',
    to: '/app1/list/viewHeader',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Edit List Header',
    to: '/app1/list/editHeader',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'View List Items (table)',
    to: '/app1/list/items',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Explore List Item',
    to: '/app1/list/items/item',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'View Item',
        to: '/app1/list/items/item/viewItem',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Edit Item',
        to: '/app1/list/items/item/editItem',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
    ]
  },
  {
    component: CNavItem,
    name: 'Make New Item',
    to: '/app1/list/createItem',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Curation',
    to: '/app1/list/curation',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'View Curation',
        to: '/app1/list/curation/viewCuration',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Edit Curation',
        to: '/app1/list/curation/editCuration',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Export Trusted List',
        to: '/app1/list/curation/exportTrustedList',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
    ]
  },
]

export default _nav
