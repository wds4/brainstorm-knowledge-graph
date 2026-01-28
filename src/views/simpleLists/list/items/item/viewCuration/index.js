import React from 'react'
import { useActiveUser } from 'nostr-hooks'
import { useLocation } from 'react-router-dom'
import { validateUUID } from 'src/lib/nip19'
import NaddrUUID from './naddr'
import EventIdUUID from './eventId'
import ATagUUID from './aTag'

const Disambiguation = ({ activeUser, uuidType, uuid }) => {
  if (uuidType === 'invalid') return <p>Invalid UUID</p>
  if (uuidType === 'naddr')
    return <NaddrUUID activeUser={activeUser} uuid={uuid} uuidType={uuidType} />
  if (uuidType === 'aTag')
    return <ATagUUID activeUser={activeUser} uuid={uuid} uuidType={uuidType} />
  if (uuidType === 'eventId')
    return <EventIdUUID activeUser={activeUser} uuid={uuid} uuidType={uuidType} />
  return <p>Unknown UUID Type: {uuidType}</p>
}

const ViewCuration = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const uuid = searchParams.get('uuid')
  const { activeUser } = useActiveUser()

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

  if (!activeUser) {
    return <p>Loading the logged-in user...</p>
  }

  return (
    <>
      <div>
        <Disambiguation
          activeUser={activeUser}
          uuidType={validateUUIDResult.uuidType}
          uuid={validateUUIDResult.uuid}
        />
      </div>
    </>
  )
}

export default ViewCuration
