import { useSubscribe } from 'nostr-hooks'
import React, { useMemo, useState, useEffect } from 'react'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const NumItemsOnList = ({ zTag = '' }) => {
  // Create filter based on zTag parameter
  const filter = zTag ? [{ kinds: [9999, 39999], '#z': [zTag] }] : []

  const filters = useMemo(() => filter, [])
  const { events } = useSubscribe({ filters, relays: aDListRelays })

  if (!events) {
    return <>?</>
  }
  if (events.length === 0) {
    return <>0</>
  }
  return <>{events.length}</>
}

export default NumItemsOnList
