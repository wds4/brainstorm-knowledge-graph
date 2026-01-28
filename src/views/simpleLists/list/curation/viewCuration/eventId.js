import React from 'react'

const EventIdUUID = ({ activeUser, uuid }) => {
  return (
    <>
      <div>
        <p>EventId UUID: {uuid || 'Not provided'}</p>
      </div>
    </>
  )
}

export default EventIdUUID
