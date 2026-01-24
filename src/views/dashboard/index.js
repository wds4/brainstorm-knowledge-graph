import React from 'react'
import { CButton, CContainer, CNavLink, CRow } from '@coreui/react'
import { CCard, CCardBody, CCardHeader, CCardText, CCardTitle, CCol } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'

const Dashboard = () => {
  return (
    <>
      <center>
        <h3>Nostr-React-Dashboard Template </h3>
      </center>
      <br />
      <br />
      <CContainer>
        <p>
          This template makes use of the{' '}
          <a target="_blank" href="https://github.com/ostyjs/nostr-hooks" rel="noreferrer">
            nostr-hooks
          </a>{' '}
          library for basic nostr functionality.
        </p>
        <p>
          The dashboard / admin layout comes from{' '}
          <a
            target="_blank"
            href="https://github.com/coreui/coreui-free-react-admin-template"
            rel="noreferrer"
          >
            CoreUI Free React.js Admin Template
          </a>
          , of which this is a fork.
        </p>
        <p>
          For a demo of basic nostr-hooks functionality, follow the "Hello World" link in the
          drop-down menu under the user avatar (you'll need to be logged in first).
          <CButton href="#/helloWorld">Demo</CButton>
        </p>
      </CContainer>
      <center>
        <h4>Apps</h4>
      </center>
      <CContainer>
        <CRow xs={{ gutter: 4 }}>
          <CCol xs={12} sm={6} xl={4} xxl={3}>
            <CCard
              style={{ width: '100%', height: '100%' }}
              className="mb-3 border-info"
              textColor="info"
            >
              <CNavLink style={{ display: 'inline-block' }} href="#/app1">
                <CCardHeader>
                  <strong>App 1</strong>
                </CCardHeader>
                <CCardBody>
                  <CCardText>Lorem ipsum!</CCardText>
                </CCardBody>
              </CNavLink>
            </CCard>
          </CCol>

          <CCol xs={12} sm={6} xl={4} xxl={3}>
            <CCard
              style={{ width: '100%', height: '100%' }}
              className="mb-3 border-primary"
              textColor="primary"
            >
              <CNavLink style={{ display: 'inline-block' }} href="#/app2">
                <CCardHeader>
                  <strong>App 2</strong>
                </CCardHeader>
                <CCardBody>
                  <CCardText>Lorem ipsum!</CCardText>
                </CCardBody>
              </CNavLink>
            </CCard>
          </CCol>

          <CCol xs={12} sm={6} xl={4} xxl={3}>
            <CCard
              style={{ width: '100%', height: '100%' }}
              className="mb-3 border-primary"
              textColor="success"
            >
              <CNavLink style={{ display: 'inline-block' }} href="#/app3">
                <CCardHeader>
                  <strong>App 3</strong>
                </CCardHeader>
                <CCardBody>
                  <CCardText>Lorem ipsum!</CCardText>
                </CCardBody>
              </CNavLink>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default Dashboard
