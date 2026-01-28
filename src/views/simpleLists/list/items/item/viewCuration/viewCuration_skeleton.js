import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useActiveUser, useSubscribe } from 'nostr-hooks'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
} from '@coreui/react'
import defaults from 'src/views/settings/parameters/defaults.json'

const ViewCuration = ({ activeUser, event, uuid, uuidType }) => {
  return (
    <div style={{ padding: '20px' }}>
      <center>
        <h3>List Item Curation Details</h3>
      </center>
    </div>
  )
}

export default ViewCuration
