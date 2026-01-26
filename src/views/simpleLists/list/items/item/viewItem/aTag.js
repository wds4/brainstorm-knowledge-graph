import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useActiveUser, useNewEvent, useSigner, useSubscribe, useNdk } from 'nostr-hooks'
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
import { getTimeAgo } from '../../../../../../lib'
import ListHeaderName from '../../../../../../components/events/listHeaderName/index.js'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')
// const customNDK = new NDK({ explicitRelayUrls: aDListRelays })
// parse tags
const parseZTag = (tags) => {
  const zTag = tags.filter((tag) => tag[0] === 'z')[0]
  return zTag ? zTag[1] : ''
}

const parseDTag = (tags) => {
  const dTag = tags.filter((tag) => tag[0] === 'd')[0]
  return dTag ? dTag[1] : ''
}

const parseDescription = (tags) => {
  const aDescription = tags.filter((tag) => tag[0] === 'description')[0]
  return aDescription ? aDescription[1] : ''
}

const parseName = (tags) => {
  const aName = tags.filter((tag) => tag[0] === 'name')[0]
  return aName ? aName[1] : ''
}

const PublishUpdatedEvent = ({ strippedEvent, isEditableByMe }) => {
  const { signer } = useSigner()

  const { createNewEvent } = useNewEvent()

  const publishUpdatedEvent = () => {
    const eventEdited = JSON.parse(document.getElementById('editRawEventTextarea').value)
    const eventUpdated = createNewEvent()
    eventUpdated.kind = eventEdited.kind
    eventUpdated.pubkey = eventEdited.pubkey
    eventUpdated.tags = eventEdited.tags
    eventUpdated.content = eventEdited.content
    signer.sign(eventUpdated)
    console.log('eventUpdated: ' + JSON.stringify(eventUpdated, null, 4))
    eventUpdated.publish()
  }
  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        color: '#333',
        padding: '15px',
        borderRadius: '5px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: isEditableByMe ? 'block' : 'none',
      }}
    >
      Edit Raw Event Panel
      <textarea style={{ width: '100%', height: '400px' }} id="editRawEventTextarea">
        {JSON.stringify(strippedEvent, null, 4)}
      </textarea>
      <CButton onClick={() => publishUpdatedEvent()}>Publish Updated Event</CButton>
    </div>
  )
}

const ATagUUID = ({ uuid }) => {
  const [kind, author, dTag_from_uuid] = uuid ? uuid.split(':') : ['', '', '']
  const [showEvent, setShowEvent] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [showEditRawEvent, setShowEditRawEvent] = useState(false)
  const { activeUser } = useActiveUser()

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
  const strippedEvent = {
    kind: event1.kind,
    pubkey: event1.pubkey,
    tags: event1.tags,
    content: event1.content,
  }

  const timeAgo = getTimeAgo(event.created_at)
  const description = parseDescription(event.tags)
  const name = parseName(event.tags)
  const dTag_from_event = parseDTag(event.tags)
  const zTag_from_event = parseZTag(event.tags)
  // check whether I am the author
  const amITheAuthor = event.pubkey === activeUser?.pubkey
  const isEditableByMe = parseInt(kind) === 39999 && amITheAuthor ? true : false

  return (
    <CContainer style={{ padding: '20px' }}>
      <center>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>{name}</h2>
      </center>
      <div style={{ marginBottom: '20px' }}>
        An item on the list of
        <ListHeaderName uuid={zTag_from_event} />
      </div>
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
          <p>
            <strong>Name:</strong> {name || 'Not available'}
          </p>
          <p>
            <strong>Description:</strong> {description || 'Not available'}
          </p>
          <p>
            <strong>Editable:</strong> {parseInt(kind) === 39999 ? 'Yes' : 'No'} (kind: {kind})
          </p>
          <p>
            <strong>When Created (or Last Updated):</strong> {timeAgo}
          </p>
        </CCard>
      </CRow>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <CButton
          color="secondary"
          size="sm"
          style={{
            marginRight: '10px',
            marginBottom: '10px',
            display: isEditableByMe ? 'inline-block' : 'none',
          }}
          onClick={() => setShowEditRawEvent(!showEditRawEvent)}
        >
          {showEditRawEvent ? 'Hide Event Raw Event' : 'Edit Raw Event'}
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
      <CRow>
        {showEditRawEvent && (
          <PublishUpdatedEvent strippedEvent={strippedEvent} isEditableByMe={isEditableByMe} />
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
      </CRow>
    </CContainer>
  )
}

export default ATagUUID
