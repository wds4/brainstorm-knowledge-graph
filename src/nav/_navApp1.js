import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Simple Lists Home',
    to: '/simpleLists',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Simple Lists',
  },
  {
    component: CNavItem,
    name: 'Lists (table)',
    to: '/simpleLists/viewLists',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Explore Single List',
    to: '/simpleLists/list',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
    items: [
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
        to: '/simpleLists/createList',
        icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Make New List',
    to: '/simpleLists/createList',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'About',
  },
  {
    component: CNavItem,
    name: 'About',
    to: '/simpleLists/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
