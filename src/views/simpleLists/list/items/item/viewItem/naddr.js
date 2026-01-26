import React from 'react'

const NaddrUUID = ({ uuid }) => {
  return (
    <>
      <div>
        <p>Naddr UUID: {uuid || 'Not provided'}</p>
      </div>
    </>
  )
}

export default NaddrUUID
