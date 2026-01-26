import React from 'react'
import { useLocation } from 'react-router-dom'
import ATagUUID from './aTag'
import EventIdUUID from './eventId'
import NaddrUUID from './naddr'
import { validateUUID } from 'src/lib/nip19'

const Disambiguation = ({ uuidType, uuid }) => {
  if (uuidType === 'invalid') return <p>Invalid UUID</p>
  if (uuidType === 'naddr') return <NaddrUUID uuid={uuid} />
  if (uuidType === 'aTag') return <ATagUUID uuid={uuid} />
  if (uuidType === 'event id') return <EventIdUUID uuid={uuid} />
  return <p>Unknown UUID Type: {uuidType}</p>
}

const ViewItems = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const uuid = searchParams.get('uuid')

  let validateUUIDResult = { uuidType: 'unknown', valid: false, error: 'unknown error' }

  if (uuid) {
    validateUUIDResult = validateUUID(uuid)

    if (validateUUIDResult.valid) {
      // update SessionStorage with listHeaderUUID
      sessionStorage.setItem('listHeaderUUID', uuid)
    }
  }

  if (!uuid) {
    // fetch listHeaderUUID from SessionStorage
    const listHeaderUUID = sessionStorage.getItem('listHeaderUUID')
    if (listHeaderUUID) {
      validateUUIDResult = validateUUID(listHeaderUUID)
    }
  }

  return (
    <>
      <div>
        <Disambiguation uuidType={validateUUIDResult.uuidType} uuid={validateUUIDResult.uuid} />
      </div>
    </>
  )
}

export default ViewItems
