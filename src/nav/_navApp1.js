import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilListFilter, cilPen, cilSpeedometer } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Simple Lists Home',
    to: '/app1',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Decentralized Lists',
  },
  {
    component: CNavItem,
    name: 'Lists (table)',
    to: '/app1/viewLists',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Explore Single List',
    to: '/app1/list',
    icon: <CIcon icon={cilPen} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'View List Header',
        to: '/app1/list/viewHeader',
      },
      {
        component: CNavItem,
        name: 'Edit List Header',
        to: '/app1/list/editHeader',
      },
      {
        component: CNavItem,
        name: 'View List Items (table)',
        to: '/app1/list/items',
      },
      {
        component: CNavGroup,
        name: 'Explore List Item',
        to: '/app1/list/items/item',
        items: [
          {
            component: CNavItem,
            name: 'View Item',
            to: '/app1/list/items/item/viewItem',
          },
          {
            component: CNavItem,
            name: 'Edit Item',
            to: '/app1/list/items/item/editItem',
          },
        ]
      },
      {
        component: CNavItem,
        name: 'Make New Item',
        to: '/app1/createList',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Make New List',
    to: '/app1/createList',
    icon: <CIcon icon={cilListFilter} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'About',
  },
  {
    component: CNavItem,
    name: 'About',
    to: '/app1/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
