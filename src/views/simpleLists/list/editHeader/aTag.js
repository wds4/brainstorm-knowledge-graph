import { CContainer } from '@coreui/react'
import React, { useMemo } from 'react'
import EditHeaderEvent from './editHeaderEvent'
import { useSubscribe } from 'nostr-hooks'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const ATagUUID = ({ uuid }) => {
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

  return (
    <>
      <EditHeaderEvent uuid={uuid} event={event} />
    </>
  )
}

export default ATagUUID
