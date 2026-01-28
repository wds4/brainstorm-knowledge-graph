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

const NextRow = ({ activeUser, event, author, name, uuid, stats }) => {
  const { trustedUpvotes, trustedDownvotes, finalScore } = stats || {
    trustedUpvotes: 0,
    trustedDownvotes: 0,
    finalScore: 0,
  }

  return (
    <CTableRow key={event.id}>
      <CTableDataCell style={{ width: '10%' }}>
        <AuthorAvatar author={author} />
      </CTableDataCell>
      <CTableDataCell style={{ width: '50%', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
        {name}
      </CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>{trustedUpvotes}</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>{trustedDownvotes}</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>
        <strong style={{ color: finalScore >= 0 ? '#28a745' : '#dc3545' }}>{finalScore}</strong>
      </CTableDataCell>
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
