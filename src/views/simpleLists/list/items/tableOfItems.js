import React, { useMemo, useState, useEffect } from 'react'
import { useActiveUser, useSubscribe } from 'nostr-hooks'
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import ProfileCard from 'src/components/users/profileCard.js'
import AuthorAvatar from '../../../../components/users/authorAvatar'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseDescription = (tags) => {
  const aDescription = tags.filter((tag) => tag[0] === 'description')[0]
  return aDescription ? aDescription[1] : ''
}

const parseName = (tags) => {
  const aName = tags.filter((tag) => tag[0] === 'name')[0]
  return aName ? aName[1] : ''
}

const parseDTag = (tags) => {
  const aDTags = tags.filter((tag) => tag[0] === 'd')[0]
  return aDTags ? aDTags[1] : ''
}

const TableOfItems = ({ zTag = '' }) => {
  const [showMyListsOnly, setShowMyListsOnly] = useState(false)
  const [kindFilter, setKindFilter] = useState('all') // 'all', 'editable', 'notEditable'
  const { activeUser } = useActiveUser()
  // Create filter based on zTag parameter
  const filter = zTag ? [{ kinds: [9999, 39999], '#z': [zTag] }] : []

  const filters = useMemo(() => filter, [])
  const { events } = useSubscribe({ filters, relays: aDListRelays })

  if (!events || events.length === 0) {
    return (
      <CContainer>
        <center>
          <h3>No Event Data Available</h3>
        </center>
        <p style={{ textAlign: 'center' }}>Could not fetch event data for the provided zTag.</p>
      </CContainer>
    )
  }

  // Filter events based on whether they are authored by the user
  const userFilteredEvents =
    showMyListsOnly && activeUser
      ? events.filter((event) => event.pubkey === activeUser.pubkey)
      : events

  // Further filter based on kind
  const filteredEvents =
    kindFilter === 'editable'
      ? userFilteredEvents.filter((event) => event.kind === 39998)
      : kindFilter === 'notEditable'
        ? userFilteredEvents.filter((event) => event.kind === 9998)
        : userFilteredEvents

  const toggleKindFilter = () => {
    setKindFilter((prev) => {
      if (prev === 'all') return 'editable'
      if (prev === 'editable') return 'notEditable'
      return 'all'
    })
  }

  return (
    <CContainer style={{ padding: '20px' }}>
      <CButton
        color="primary"
        size="sm"
        style={{ marginBottom: '10px' }}
        href={`#/simpleLists/list/viewHeader`}
      >
        List Header: Overview
      </CButton>
      <p>Events: {events.length}</p>
      <CTable striped hover style={{ width: '100%', tableLayout: 'fixed' }}>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ width: '10%' }}>Author</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '25%' }}>Name</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '45%' }}>Description</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>Kind</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredEvents.map((event) => {
            const description = parseDescription(event.tags)
            const name = parseName(event.tags)
            const author = event.pubkey
            const kind = event.kind
            let uuid = ''
            if (parseInt(kind) === 39999) {
              const dTag = parseDTag(event.tags)
              uuid = kind + ':' + author + ':' + dTag
            }
            if (parseInt(kind) === 9999) {
              uuid = event.id
            }
            return (
              <CTableRow key={event.id}>
                <CTableDataCell style={{ width: '10%' }}>
                  <AuthorAvatar author={author} />
                </CTableDataCell>
                <CTableDataCell
                  style={{ width: '25%', wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {name}
                </CTableDataCell>
                <CTableDataCell
                  style={{ width: '45%', wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                >
                  {description}
                </CTableDataCell>
                <CTableDataCell style={{ width: '10%' }}>{kind}</CTableDataCell>
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
          })}
        </CTableBody>
      </CTable>
    </CContainer>
  )
}

export default TableOfItems
