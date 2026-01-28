import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useActiveUser, useNewEvent, useSigner, useSubscribe, useNdk } from 'nostr-hooks'
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
import ProfileCard from 'src/components/users/profileCard.js'
import { getTimeAgo } from '../../../../../../lib'
import ListHeaderName from '../../../../../../components/events/listHeaderName/index.js'
import ViewCuration from './viewCuration.js'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const parseName = (tags) => {
  const aName = tags.filter((tag) => tag[0] === 'name')[0]
  return aName ? aName[1] : ''
}

const ATagUUID = ({ activeUser, uuid, uuidType }) => {
  const [kind, author, dTag_from_uuid] = uuid ? uuid.split(':') : ['', '', '']

  // Create filter based on aTag parameters
  const filter =
    kind && author && dTag_from_uuid
      ? [{ kinds: [parseInt(kind)], authors: [author], '#d': [dTag_from_uuid] }]
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
  const name = parseName(event.tags)
  return (
    <CContainer style={{ padding: '20px' }}>
      <center>
        <h2 style={{ marginBottom: '20px' }}>{name}</h2>
      </center>
      <ViewCuration activeUser={activeUser} event={event} uuid={uuid} uuidType={uuidType} />
    </CContainer>
  )
}

export default ATagUUID
