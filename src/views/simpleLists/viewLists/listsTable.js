import React, { useMemo, useState, useEffect } from 'react'
import { useSubscribe, useActiveUser, useNdk } from 'nostr-hooks'
import {
  CAvatar,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CFormLabel,
} from '@coreui/react'

import { asyncFetchProfile } from 'src/helpers/ndk'
import { noProfilePicUrl } from 'src/const'
import AuthorAvatar from '../../../components/users/authorAvatar'
import NumItemsOnList from '../../../components/events/numItemsOnList'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const ListsTable = () => {
  const [showMyListsOnly, setShowMyListsOnly] = useState(false)
  const [kindFilter, setKindFilter] = useState('all') // 'all', 'editable', 'notEditable'
  const [searchKeyword, setSearchKeyword] = useState('')
  const { activeUser } = useActiveUser()

  // useMemo prevents rerendering hell
  const filters = useMemo(() => [{ kinds: [9998, 39998], limit: 1000 }], [])

  // parse tags
  const parseDescription = (tags) => {
    const aDescription = tags.filter((tag) => tag[0] === 'description')[0]
    return aDescription ? aDescription[1] : ''
  }

  const parseNamePlural = (tags) => {
    const aNames = tags.filter((tag) => tag[0] === 'names')[0]
    return aNames ? aNames[2] : ''
  }

  const parseDTag = (tags) => {
    const aDTags = tags.filter((tag) => tag[0] === 'd')[0]
    return aDTags ? aDTags[1] : ''
  }

  const { events } = useSubscribe({ filters, relays: aDListRelays })

  // Filter events based on whether they are authored by the user
  const userFilteredEvents = useMemo(() => {
    if (!events || events.length === 0) return []
    return showMyListsOnly && activeUser
      ? events.filter((event) => event.pubkey === activeUser.pubkey)
      : events
  }, [events, showMyListsOnly, activeUser])

  // Further filter based on kind
  const kindFilteredEvents = useMemo(() => {
    if (kindFilter === 'editable') {
      return userFilteredEvents.filter((event) => event.kind === 39998)
    }
    if (kindFilter === 'notEditable') {
      return userFilteredEvents.filter((event) => event.kind === 9998)
    }
    return userFilteredEvents
  }, [userFilteredEvents, kindFilter])

  // Filter by search keyword (name or description)
  const filteredEvents = useMemo(() => {
    if (!searchKeyword.trim()) {
      return kindFilteredEvents
    }

    const keyword = searchKeyword.toLowerCase().trim()
    return kindFilteredEvents.filter((event) => {
      const namePlural = parseNamePlural(event.tags).toLowerCase()
      const description = parseDescription(event.tags).toLowerCase()
      return namePlural.includes(keyword) || description.includes(keyword)
    })
  }, [kindFilteredEvents, searchKeyword])

  console.log('rerender ViewLists; events.length: ' + (events?.length || 0))

  if (!events || events.length === 0) {
    return (
      <>
        <p>the active aDListRelays will go here:</p>
        <pre>{JSON.stringify(sessionStorage.getItem('aDListRelays'))}</pre>
        <div>No events</div>
      </>
    )
  }

  const toggleKindFilter = () => {
    setKindFilter((prev) => {
      if (prev === 'all') return 'editable'
      if (prev === 'editable') return 'notEditable'
      return 'all'
    })
  }

  const getKindFilterLabel = () => {
    if (kindFilter === 'all') return 'Editable & Not Editable'
    if (kindFilter === 'editable') return 'Editable Only'
    return 'Not Editable Only'
  }

  return (
    <>
      <div>
        Showing:{' '}
        <CButton
          color="secondary"
          size="sm"
          style={{ marginBottom: '10px', marginRight: '10px' }}
          onClick={toggleKindFilter}
        >
          {getKindFilterLabel()}
        </CButton>
        {activeUser && (
          <CButton
            color="secondary"
            size="sm"
            style={{ marginBottom: '10px' }}
            onClick={() => setShowMyListsOnly(!showMyListsOnly)}
          >
            {showMyListsOnly ? 'My Lists' : 'All Authors'}
          </CButton>
        )}

        {/* Search Field */}
        <div style={{ marginBottom: '15px', marginTop: '10px' }}>
          <CFormLabel htmlFor="searchKeyword" style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Filter by Name or Description:
          </CFormLabel>
          <CFormInput
            id="searchKeyword"
            type="text"
            placeholder="Enter keyword to search..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <p>number of events: {filteredEvents.length}</p>
        <CTable striped hover style={{ width: '100%', tableLayout: 'fixed' }}>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '7%' }}>Author</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '27%' }}>Name</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '5%' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '45%' }}>Description</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '8%' }}>Kind</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '8%' }}>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredEvents.map((event) => {
              const description = parseDescription(event.tags)
              const namePlural = parseNamePlural(event.tags)
              const author = event.pubkey
              const kind = event.kind
              let uuid = ''
              if (kind === 39998) {
                const dTag = parseDTag(event.tags)
                uuid = kind + ':' + author + ':' + dTag
              }
              if (kind === 9998) {
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
                    {namePlural}
                  </CTableDataCell>
                  <CTableDataCell>
                    <NumItemsOnList zTag={uuid} />
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
                      href={`#/simpleLists/list/viewHeader?uuid=${uuid}`}
                    >
                      View
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              )
            })}
          </CTableBody>
        </CTable>
      </div>
    </>
  )
}

export default ListsTable
