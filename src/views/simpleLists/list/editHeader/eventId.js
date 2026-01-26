import React from 'react'

const EventIdUUID = ({uuid}) => {
  return (
    <>
      <div>
        <p>EventId UUID: {uuid || 'Not provided'}</p>
        <p>This is is not editable.</p>
      </div>
    </>
  )
}

export default EventIdUUID
