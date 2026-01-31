import React, { useMemo } from 'react'
import { useSubscribe } from 'nostr-hooks'
import { CContainer } from '@coreui/react'
import CreateItem from './createItem'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const EventIdUUID = ({ activeUser, uuid = '' }) => {
  // Create filter based on event ID
  const filter = uuid ? [{ ids: [uuid] }] : []

  const filters = useMemo(() => filter, [uuid])
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
        <h4 style={{ marginBottom: '20px' }}>Create New Item for the List of:</h4>
        <h2 style={{ marginBottom: '20px' }}>{namePlural}</h2>
      </center>
      <CreateItem activeUser={activeUser} event={event} zTag={uuid} />
    </CContainer>
  )
}

export default EventIdUUID
