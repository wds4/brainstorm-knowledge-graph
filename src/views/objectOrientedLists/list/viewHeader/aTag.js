import React from 'react'

const ATagUUID = ({uuid}) => {
  return (
    <>
      <div>
        <p>ATag UUID: {uuid || 'Not provided'}</p>
      </div>
    </>
  )
}

export default ATagUUID
