import React from 'react'
import { CContainer, CNavLink, CRow } from '@coreui/react'
import { CCard, CCardBody, CCardHeader, CCardText, CCol } from '@coreui/react'

const Dashboard = () => {
  return (
    <>
      <center>
        <h3>Brainstorm Knowledge Graph</h3>
      </center>
      <br />
      <br />
      <CContainer>
        <p>
          This app uses the{' '}
          <a
            target="_blank"
            href="https://nostrhub.io/naddr1qvzqqqrcvypzpef89h53f0fsza2ugwdc3e54nfpun5nxfqclpy79r6w8nxsk5yp0qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqymyv43k2mn5wfskc6t6v4jz6mrfwd68xnwasck"
            rel="noreferrer"
          >
            Decentralized Lists
          </a>{' '}
          and related family of Custom NIPs to create a knowledge graph that can be curated with the
          assistance of your trusted community.
        </p>
      </CContainer>
      <center>
        <h4>Workspaces</h4>
      </center>
      <CContainer>
        <CRow xs={{ gutter: 4 }}>
          <CCol xs={12} sm={6} xl={4} xxl={3}>
            <CCard
              style={{ width: '100%', height: '100%' }}
              className="mb-3 border-info"
              textColor="info"
            >
              <CNavLink style={{ display: 'inline-block' }} href="#/simpleLists">
                <CCardHeader>
                  <strong>Simple Lists</strong>
                </CCardHeader>
                <CCardBody>
                  <CCardText>Basic implementation of the Decentralized Lists NIP</CCardText>
                </CCardBody>
              </CNavLink>
            </CCard>
          </CCol>

          <CCol xs={12} sm={6} xl={4} xxl={3}>
            <CCard
              style={{ width: '100%', height: '100%' }}
              className="mb-3 border-info"
              textColor="info"
            >
              <CNavLink style={{ display: 'inline-block' }} href="#/concepts">
                <CCardHeader>
                  <strong>Concepts</strong>
                </CCardHeader>
                <CCardBody>
                  <CCardText>
                    Concept: a simple list imbued with a structure (organized into subsets) and a
                    property tree.
                  </CCardText>
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
