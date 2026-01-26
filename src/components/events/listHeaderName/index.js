import { useSubscribe } from 'nostr-hooks'
import React, { useMemo, useState, useEffect } from 'react'
import { validateUUID } from 'src/lib/nip19'
import ATagUUID from './aTag'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const Disambiguation = ({ uuidType, uuid }) => {
  if (uuidType === 'invalid') return <>Invalid UUID</>
  // if (uuidType === 'naddr') return <NaddrUUID uuid={uuid} />
  if (uuidType === 'aTag')
    return (
      <>
        <ATagUUID uuid={uuid} />
      </>
    )
  // if (uuidType === 'event id') return <EventIdUUID uuid={uuid} />
  return <>Unknown UUID Type: {uuidType}</>
}

const ListHeaderName = ({ uuid = '' }) => {
  let validateUUIDResult = { uuidType: 'unknown', valid: false, error: 'unknown error' }

  if (uuid) {
    validateUUIDResult = validateUUID(uuid)
  }
  return (
    <>
      <Disambiguation uuidType={validateUUIDResult.uuidType} uuid={validateUUIDResult.uuid} />
    </>
  )
}

export default ListHeaderName
