import React, { useMemo, useState, useEffect } from 'react'
import { useSubscribe } from 'nostr-hooks'
import { CButton } from '@coreui/react'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags

const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const ATagUUID = ({ uuid = '' }) => {
  const [kind, author, dTag_from_uuid] = uuid ? uuid.split(':') : ['', '', '']

  // Create filter based on aTag parameters
  const filter =
    kind && author && dTag_from_uuid
      ? [{ kinds: [parseInt(kind)], authors: [author], '#d': [dTag_from_uuid] }]
      : []

  const filters = useMemo(() => filter, [])
  const { events } = useSubscribe({ filters, relays: aDListRelays })

  if (!events || events.length === 0) {
    return <>unknown header name</>
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
    <CButton
      color="secondary"
      href={`#/simpleLists/list/viewHeader?uuid=${uuid}`}
      style={{ marginLeft: '10px'}}
    >
      {namePlural || 'Not available'}
    </CButton>
  )
}

export default ATagUUID
