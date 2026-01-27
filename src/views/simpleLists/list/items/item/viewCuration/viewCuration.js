import React from 'react'
import { useActiveUser } from 'nostr-hooks'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const ViewCuration = ({ event, uuid, uuidType }) => {
  const { activeUser } = useActiveUser()
  return (
    <>
      <div>ViewCuration</div>
    </>
  )
}

export default ViewCuration
