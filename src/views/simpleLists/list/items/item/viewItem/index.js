import React from 'react'
import { useLocation } from 'react-router-dom'
import { validateUUID } from 'src/lib/nip19'
import NaddrUUID from './naddr'
import EventIdUUID from './eventId'
import ATagUUID from './aTag'

const Disambiguation = ({ uuidType, uuid }) => {
  if (uuidType === 'invalid') return <p>Invalid UUID</p>
  if (uuidType === 'naddr') return <NaddrUUID uuid={uuid} />
  if (uuidType === 'aTag') return <ATagUUID uuid={uuid} />
  if (uuidType === 'eventId') return <EventIdUUID uuid={uuid} />
  return <p>Unknown UUID Type: {uuidType}</p>
}

const ViewItem = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const uuid = searchParams.get('uuid')

  let validateUUIDResult = { uuidType: 'unknown', valid: false, error: 'unknown error' }

  if (uuid) {
    validateUUIDResult = validateUUID(uuid)

    if (validateUUIDResult.valid) {
      // update SessionStorage with listHeaderUUID
      sessionStorage.setItem('listItemUUID', uuid)
    }
  }

  if (!uuid) {
    // fetch listHeaderUUID from SessionStorage
    const listItemUUID = sessionStorage.getItem('listItemUUID')
    if (listItemUUID) {
      validateUUIDResult = validateUUID(listItemUUID)
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

export default ViewItem
