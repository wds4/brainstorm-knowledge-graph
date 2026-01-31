import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import navigationHelloWorld from 'src/nav/_navHelloWorld'
import navigationProfile from 'src/nav/_navProfile'
import navigationDashboard from 'src/nav/_navDashboard'
import navigationHSettings from 'src/nav/_navSettings'
import navigationApp1 from 'src/nav/_navApp1'
import navigationApp1_list from 'src/nav/_navApp1_list'
import navigationApp1_list_item from 'src/nav/_navApp1_list_item'
import navigationApp1_list_curation from 'src/nav/_navApp1_list_curation'
import navigationConcepts from 'src/nav/_navConcepts'
import navigationApp2 from 'src/nav/_navApp2'
import navigationApp3 from 'src/nav/_navApp3'

// const iconSrc = 'src/assets/brand/brainstorm010_white.svg'
const iconSrc = 'src/assets/brand/brainstorm010_white.svg'

function getNavigation(currentLocation) {
  const activeApp = currentLocation.split('/')[1]
  const currentLocationPieces = currentLocation.split('/')
  const depth = currentLocationPieces.length
  // console.log(`Active App: ${activeApp}, Depth: ${depth}, Current Location: ${currentLocation}`)
  switch (activeApp) {
    case 'dashboard':
      return navigationDashboard
    case 'profile':
      return navigationProfile
    case 'helloWorld':
      return navigationHelloWorld
    case 'settings':
      return navigationHSettings
    case 'simpleLists':
      if (depth == 6) {
        if (currentLocationPieces[4] === 'item') {
          return navigationApp1_list_item
        }
      }
      if (depth > 3) {
        if (currentLocationPieces[3] === 'curation') {
          return navigationApp1_list_curation
        }
        return navigationApp1_list
      } else {
        return navigationApp1
      }
    case 'concepts':
      return navigationConcepts
    case 'app2':
      return navigationApp2
    case 'app3':
      return navigationApp3
    default:
      return navigationDashboard
  }
}

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const currentLocation = useLocation().pathname
  const navigation = getNavigation(currentLocation)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand href="#/dashboard" to="/" style={{ textDecoration: 'none' }}>
          <img src={iconSrc} style={{ height: '32px', marginLeft: '8px', marginRight: '10px' }} />
          Knowledge Graph
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
