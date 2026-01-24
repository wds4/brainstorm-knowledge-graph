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
import navigationApp2 from 'src/nav/_navApp2'
import navigationApp3 from 'src/nav/_navApp3'

// const iconSrc = 'src/assets/brand/brainstorm010_white.svg'
const iconSrc = 'src/assets/brand/brainstorm010_white.svg'

function getNavigation(activeApp, signedIn, developmentMode) {
  switch (activeApp) {
    case 'dashboard':
      return navigationDashboard
    case 'profile':
      return navigationProfile
    case 'helloWorld':
      return navigationHelloWorld
    case 'settings':
      return navigationHSettings
    case 'app1':
      return navigationApp1
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
  const topLevelLocation = currentLocation.split('/')[1]
  const navigation = getNavigation(topLevelLocation)

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
          PGFT NRD Template
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
