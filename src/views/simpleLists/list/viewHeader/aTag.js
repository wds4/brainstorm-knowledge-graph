import React, { useMemo, useState, useEffect } from 'react'
import { useSubscribe } from 'nostr-hooks'
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from '@coreui/react'
import ProfileCard from 'src/components/users/profileCard.js'
import { getTimeAgo } from '../../../../lib'
import NumItemsOnList from '../../../../components/events/numItemsOnList'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseDTag = (tags) => {
  const dTag = tags.filter((tag) => tag[0] === 'd')[0]
  return dTag ? dTag[1] : ''
}

const parseDescription = (tags) => {
  const aDescription = tags.filter((tag) => tag[0] === 'description')[0]
  return aDescription ? aDescription[1] : ''
}

const parseNameSingular = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[1] : ''
}

const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const parseChildTag = (tagType, tags) => {
  const aFilteredTags = tags.filter((tag) => tag[0] === tagType)
  return aFilteredTags ? aFilteredTags : []
}

const ChildTagPanel = ({ tagType = '', tags = [] }) => {
  const aFilteredTags = parseChildTag(tagType, tags)
  if (aFilteredTags.length === 0) {
    return null
  }
  return (
    <CCardBody>
      <CCardTitle style={{ marginBottom: '15px' }}>
        <i>{tagType}</i>
      </CCardTitle>
      <CCardText>
        {aFilteredTags.map((tag) => (
          <p key={tag[1]} style={{ marginLeft: '20px' }}>
            {tag[1]}
          </p>
        ))}
      </CCardText>
    </CCardBody>
  )
}

const ATagUUID = ({ uuid = '' }) => {
  const [kind, author, dTag_from_uuid] = uuid ? uuid.split(':') : ['', '', '']
  const [showFilters, setShowFilters] = useState(false)
  const [showEvent, setShowEvent] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [showChildTagRequirements, setShowChildTagRequirements] = useState(false)

  // Create filter based on aTag parameters
  const filter =
    kind && author && dTag_from_uuid
      ? [{ kinds: [parseInt(kind)], authors: [author], '#d': [dTag_from_uuid] }]
      : []

  const filters = useMemo(() => filter, [])
  const { events } = useSubscribe({ filters, relays: aDListRelays })

  if (!events || events.length === 0) {
    return (
      <CContainer>
        <center>
          <h3>No Event Data Available</h3>
        </center>
        <p style={{ textAlign: 'center' }}>Could not fetch event data for the provided UUID.</p>
      </CContainer>
    )
  }

  const event1 = events[0]
  const event = {
    id: event1.id,
    kind: event1.kind,
    pubkey: event1.pubkey,
    tags: event1.tags,
    created_at: event1.created_at,
    content: event1.content,
    sig: event1.sig,
  }

  const timeAgo = getTimeAgo(event.created_at)
  const description = parseDescription(event.tags)
  const nameSingular = parseNameSingular(event.tags)
  const dTag_from_event = parseDTag(event.tags)
  const namePlural = parseNamePlural(event.tags)

  return (
    <CContainer style={{ padding: '20px' }}>
      <center>
        <h2 style={{ marginBottom: '20px' }}>{namePlural}</h2>
      </center>
      <CRow>
        <ProfileCard pubkey={author} />
      </CRow>
      <CRow>
        <CCard
          style={{
            marginBottom: '20px',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        >
          <CCardBody>
            <CCardTitle style={{ marginBottom: '15px' }}>List Details</CCardTitle>
            <CCardText>
              <p>
                <strong>Name Singular:</strong> {nameSingular || 'Not available'}
              </p>
              <p>
                <strong>Name Plural:</strong> {namePlural || 'Not available'}
              </p>
              <p>
                <strong>Description:</strong> {description || 'Not available'}
              </p>
              <p>
                <strong>Editable:</strong> {parseInt(kind) === 39998 ? 'Yes' : 'No'} (kind: {kind})
              </p>
              <p>
                <strong>When Created (or Last Updated):</strong> {timeAgo}
              </p>
              <p>
                <strong>Num Items:</strong> <NumItemsOnList zTag={uuid} />
                <CButton
                  color="secondary"
                  size="sm"
                  style={{ marginLeft: '10px' }}
                  href={`#/simpleLists/list/items?uuid=${uuid}`}
                >
                  View Items
                </CButton>
              </p>
            </CCardText>
          </CCardBody>
        </CCard>
      </CRow>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <CButton
          color="secondary"
          size="sm"
          style={{ marginRight: '10px', marginBottom: '10px' }}
          onClick={() => setShowChildTagRequirements(!showChildTagRequirements)}
        >
          {showChildTagRequirements ? 'Hide Child Tag Requirmenets' : 'Show Child Tag Requirements'}
        </CButton>
        <CButton
          color="secondary"
          size="sm"
          style={{ marginRight: '10px', marginBottom: '10px' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filter' : 'Show Filter'}
        </CButton>
        <CButton
          color="secondary"
          size="sm"
          style={{ marginRight: '10px', marginBottom: '10px' }}
          onClick={() => setShowEvent(!showEvent)}
        >
          {showEvent ? 'Hide Raw Event Data' : 'Show Raw Event Data'}
        </CButton>
        <CButton
          color="secondary"
          size="sm"
          style={{ marginBottom: '10px' }}
          onClick={() => setShowMetadata(!showMetadata)}
        >
          {showMetadata ? 'Hide Metadata' : 'Show Metadata'}
        </CButton>
      </div>
      {showChildTagRequirements && (
        <CRow>
          <CCard
            style={{
              marginBottom: '20px',
              border: 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ChildTagPanel tagType="required" tags={event.tags} />
            <ChildTagPanel tagType="optional" tags={event.tags} />
            <ChildTagPanel tagType="allowed" tags={event.tags} />
            <ChildTagPanel tagType="recommended" tags={event.tags} />
            <ChildTagPanel tagType="disallowed" tags={event.tags} />
          </CCard>
        </CRow>
      )}
      {showFilters && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            color: '#333',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            marginTop: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h5 style={{ marginBottom: '10px' }}>Filter</h5>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              backgroundColor: '#e9ecef',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            {JSON.stringify(filters[0], null, 4)}
          </pre>
        </div>
      )}
      {showEvent && (
        <div
          style={{
            backgroundColor: '#f8f9fa',
            color: '#333',
            padding: '15px',
            borderRadius: '5px',
            marginTop: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h5 style={{ marginBottom: '10px' }}>Raw Event Data</h5>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              backgroundColor: '#e9ecef',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            {JSON.stringify(event, null, 4)}
          </pre>
        </div>
      )}
      {showMetadata && (
        <CRow>
          <CCard
            style={{
              marginBottom: '20px',
              border: 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <CCardBody>
              <CCardTitle style={{ marginBottom: '15px' }}>UUID Metadata</CCardTitle>
              <CCardText>
                <p>
                  <strong>aTag UUID:</strong> {uuid || 'Not provided'}
                </p>
                <p>
                  <strong>Kind:</strong> {kind || 'Not available'}
                </p>
                <p>
                  <strong>Author:</strong> {author || 'Not available'}
                </p>
                <p>
                  <strong>dTag (from UUID):</strong> {dTag_from_uuid || 'Not available'}
                </p>
              </CCardText>
            </CCardBody>
            <CCardBody>
              <CCardTitle style={{ marginBottom: '15px' }}>Event Metadata</CCardTitle>
              <CCardText>
                <p>
                  <strong>Event ID:</strong> {event.id}
                </p>
                <p>
                  <strong>dTag (from event tags):</strong> {dTag_from_event || 'Not available'}
                </p>
              </CCardText>
            </CCardBody>
          </CCard>
        </CRow>
      )}
    </CContainer>
  )
}

export default ATagUUID
