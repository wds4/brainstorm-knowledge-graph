import { CContainer } from '@coreui/react'
import React from 'react'

const EditHeaderEvent = ({ uuid, event }) => {
  return (
    <CContainer style={{ padding: '20px', maxWidth: '800px' }}>
      <center>
        <h2 style={{ marginBottom: '30px' }}>Edit Existing List Header</h2>
      </center>
    </CContainer>
  )
}

export default EditHeaderEvent
