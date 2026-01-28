import React from 'react'
import {
  CButton,
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import AuthorAvatar from 'src/components/users/authorAvatar'

const NextRow = ({ activeUser, event, author, name, uuid }) => {
  return (
    <CTableRow key={event.id}>
      <CTableDataCell style={{ width: '10%' }}>
        <AuthorAvatar author={author} />
      </CTableDataCell>
      <CTableDataCell style={{ width: '50%', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
        {name}
      </CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>👍</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>👎</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>total</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>
        <CButton
          color="primary"
          size="sm"
          href={`#/simpleLists/list/items/item/viewItem?uuid=${uuid}`}
        >
          View
        </CButton>
      </CTableDataCell>
    </CTableRow>
  )
}

export default NextRow
