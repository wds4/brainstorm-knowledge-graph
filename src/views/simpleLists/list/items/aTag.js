import React, { useMemo, useState } from 'react'
import { useSubscribe } from 'nostr-hooks'
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from '@coreui/react'
import TableOfItems from './tableOfItems'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const ATagUUID = ({ uuid = '' }) => {
  const [kind, author, dTag_of_header] = uuid ? uuid.split(':') : ['', '', '']

  // Create filter based on aTag parameters
  const filter =
    kind && author && dTag_of_header
      ? [{ kinds: [parseInt(kind)], authors: [author], '#d': [dTag_of_header] }]
      : []

  const filters = useMemo(() => filter, [])
  const { events } = useSubscribe({ filters, relays: aDListRelays })

  if (!events || events.length === 0) {
    return (
      <CContainer>
        <center>
          <h3>No Event Data Available</h3>
        </center>
        <p style={{ textAlign: 'center' }}>Could not fetch event data for the provided UUID.</p>
      </CContainer>
    )
  }

  const event1 = events[0]
  const event = {
    id: event1.id,
    kind: event1.kind,
    pubkey: event1.pubkey,
    tags: event1.tags,
    created_at: event1.created_at,
    content: event1.content,
    sig: event1.sig,
  }

  const namePlural = parseNamePlural(event.tags)

  return (
    <CContainer style={{ padding: '20px' }}>
      <center>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>{namePlural}</h2>
      </center>
      <CRow>
        <TableOfItems zTag={uuid} />
      </CRow>
    </CContainer>
  )
}

export default ATagUUID
