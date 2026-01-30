import React, { useState, useMemo, useEffect } from 'react'
import { useNewEvent, useSigner, useSubscribe } from 'nostr-hooks'
import Confetti from 'react-confetti'
import {
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CFormInput,
  CFormLabel,
  CAlert,
} from '@coreui/react'

// parse tags
const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const parseNameSingular = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[1] : ''
}

const parseDTag = (tags) => {
  const aDTag = tags.filter((tag) => tag[0] === 'd')[0]
  return aDTag ? aDTag[1] : ''
}

// Generate automatic d-tag
const generateAutoDTag_backup = (singular, plural, desc) => {
  if (!singular || !plural) return ''
  const timestamp = Math.floor(Date.now() / 1000)
  const concatenated = `${singular}${plural}${desc}${timestamp}`
  let hash = 0
  for (let i = 0; i < concatenated.length; i++) {
    const char = concatenated.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).substring(0, 16)
}

// Generate automatic d-tag
const generateAutoDTag = (event) => {
  if (event.kind === 9998 || event.kind === 9999) {
    return event.id
  }
  if (event.kind === 39998 || event.kind === 39999) {
    const a_tag = event.kind + ':' + event.pubkey + ':' + parseDTag(event.tags)
    return a_tag
  }
}

const PublishTrustedList = ({ activeUser, filteredResults, event }) => {
  const namePlural = parseNamePlural(event.tags)
  const nameSingular = parseNameSingular(event.tags)
  const defaultListName = `curated list of ${namePlural}`

  const [listName, setListName] = useState(defaultListName)
  const [showPreview, setShowPreview] = useState(false)
  const [publishStartTime, setPublishStartTime] = useState(null)
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [eventVerified, setEventVerified] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const { signer } = useSigner()
  const { createNewEvent } = useNewEvent()

  // Get relay URLs from sessionStorage
  const aTrustedListRelays = useMemo(() => {
    try {
      const relays = JSON.parse(sessionStorage.getItem('aTrustedListRelays') || '[]')
      return relays
    } catch {
      return []
    }
  }, [])

  const aDListRelays = useMemo(() => {
    try {
      const relays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')
      return relays
    } catch {
      return []
    }
  }, [])

  // Filter items with score >= 1
  const qualifyingItems = useMemo(() => {
    return filteredResults.filter((item) => item.stats.finalScore >= 1)
  }, [filteredResults])

  // Generate d-tag
  const dTag = useMemo(() => {
    return generateAutoDTag(event)
  }, [event])

  // Build event tags
  const buildEventTags = () => {
    const tags = []

    // D tag (for replaceable events)
    tags.push(['d', dTag])

    // Name tag
    tags.push(['name', listName])

    // Metric tag
    tags.push(['metric', 'trusted-reactions'])

    // Relay hint (first relay from aDListRelays or empty string)
    const relayHint = aDListRelays.length > 0 ? aDListRelays[0] : ''

    // Add e-tags and a-tags for qualifying items (score >= 1)
    qualifyingItems.forEach((item) => {
      const { event: itemEvent, stats } = item
      const scoreString = stats.finalScore.toString()

      if (itemEvent.kind === 9999) {
        // e-tag for kind 9999
        tags.push(['e', itemEvent.id, relayHint, itemEvent.pubkey, scoreString])
      } else if (itemEvent.kind === 39999) {
        // a-tag for kind 39999
        const d = itemEvent.tags.find((t) => t[0] === 'd')?.[1]
        if (d) {
          const aTagCoords = `${itemEvent.kind}:${itemEvent.pubkey}:${d}`
          tags.push(['a', aTagCoords, relayHint, itemEvent.pubkey, scoreString])
          // tags.push(['a', aTagCoords, relayHint, itemEvent.pubkey])
        }
      }
    })

    return tags
  }

  // Build preview event
  const previewEvent = useMemo(() => {
    if (!listName.trim()) return null

    return {
      kind: 30391,
      pubkey: activeUser?.pubkey || '',
      tags: buildEventTags(),
      content: '',
      created_at: Math.floor(Date.now() / 1000),
    }
  }, [listName, qualifyingItems, dTag, activeUser])

  // Subscribe to verify published event
  const verificationFilter = useMemo(() => {
    if (!publishStartTime || !activeUser?.pubkey || !isWaitingForVerification) {
      return null
    }

    return {
      authors: [activeUser.pubkey],
      kinds: [30391],
      since: publishStartTime - 30,
      limit: 5,
    }
  }, [publishStartTime, activeUser?.pubkey, isWaitingForVerification])

  const subscribeParams = useMemo(() => {
    return {
      filters: verificationFilter ? [verificationFilter] : [],
      relays: aTrustedListRelays,
      enabled: !!publishStartTime && isWaitingForVerification,
    }
  }, [verificationFilter, aTrustedListRelays, publishStartTime, isWaitingForVerification])

  const { events: verificationEvents } = useSubscribe(subscribeParams)

  // Timer effect for verification waiting
  useEffect(() => {
    let interval
    if (isWaitingForVerification && !eventVerified) {
      interval = setInterval(() => {
        setVerificationTimer((prev) => {
          const newTime = prev + 1
          if (newTime >= 30) {
            setIsWaitingForVerification(false)
            setVerificationFailed(true)
            return 0
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWaitingForVerification, eventVerified])

  // Check for event verification
  useEffect(() => {
    if (verificationEvents && verificationEvents.length > 0 && isWaitingForVerification) {
      setEventVerified(true)
      setIsWaitingForVerification(false)
      setShowConfetti(true)
      setVerificationTimer(0)

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [verificationEvents, isWaitingForVerification])

  // Publish trusted list
  const publishTrustedList = () => {
    if (!listName.trim() || !previewEvent) return

    if (!activeUser?.pubkey) {
      alert('Please make sure you are logged in before publishing.')
      return
    }

    if (qualifyingItems.length === 0) {
      alert('No items qualify for the trusted list (score must be >= 1).')
      return
    }

    const eventToPublish = createNewEvent()
    eventToPublish.kind = previewEvent.kind
    eventToPublish.tags = previewEvent.tags
    eventToPublish.content = previewEvent.content

    const publishTime = Math.floor(Date.now() / 1000)
    setPublishStartTime(publishTime)
    setIsWaitingForVerification(true)
    setVerificationTimer(0)
    setEventVerified(false)
    setVerificationFailed(false)

    signer.sign(eventToPublish)
    eventToPublish.publish()
  }

  return (
    <>
      {showConfetti && <Confetti />}

      <CCard style={{ marginBottom: '20px' }}>
        <CCardBody>
          <CCardTitle>Publish Trusted List</CCardTitle>
          <p className="text-muted">
            Publish the curated items of this list as a kind 30391 Trusted List. Only items with a
            score of 1 or higher will be included.
          </p>

          {/* List Name Input */}
          <div className="mb-3">
            <CFormLabel htmlFor="listName">List Name *</CFormLabel>
            <CFormInput
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., curated list of countries"
              required
            />
          </div>

          {/* Stats */}
          <p className="text-muted">
            <strong>Qualifying items:</strong> {qualifyingItems.length} of {filteredResults.length}{' '}
            (score ≥ 1)
          </p>
          <p className="text-muted">
            <strong>d-tag:</strong> {dTag}
          </p>
          <p className="text-muted">
            <strong>Publishing to:</strong> {aTrustedListRelays.length} relay(s)
          </p>

          {/* Buttons */}
          <div className="d-flex gap-2 mb-3">
            <CButton
              color="secondary"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!listName.trim()}
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </CButton>
            <CButton
              color="primary"
              onClick={publishTrustedList}
              disabled={
                !listName.trim() || isWaitingForVerification || qualifyingItems.length === 0
              }
            >
              {isWaitingForVerification ? `Publishing... (${verificationTimer}s)` : 'Publish'}
            </CButton>
          </div>

          {/* Success/Failure Messages */}
          {eventVerified && (
            <CAlert color="success">
              ✅ Trusted list published successfully! Event has been verified on the relays.
            </CAlert>
          )}

          {verificationFailed && (
            <CAlert color="warning">
              ⚠️ Event was published but could not be verified within 30 seconds. It may still
              propagate to relays.
            </CAlert>
          )}

          {/* Preview */}
          {showPreview && previewEvent && (
            <div className="mt-3">
              <CCardTitle>Raw Event Preview</CCardTitle>
              <pre
                style={{
                  padding: '15px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxHeight: '400px',
                }}
              >
                {JSON.stringify(previewEvent, null, 2)}
              </pre>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default PublishTrustedList

/*
Example Trusted List, for list with name (plural) of `countries`

{
  "id": "<id>",
  "pubkey": "<logged-in-user-pubkey>",
  "created_at": <timestamp>,
  "kind": 30391,
  "content": "",
  "tags": [
    ["d", "4dj020e4"],
    ["name", "curated list of countries"],
    ["metric", "trusted-reactions"],
    ["e", "<event id>", "<relay hint>", "<author pubkey>", "100"],
    ["e", "<event id>", "<relay hint>", "<author pubkey>", "89"],
    ["a", "<kind>:<pubkey>:<d-tag>", "<relay hint>", "<author pubkey>", "86"],
    ["a", "<kind>:<pubkey>:<d-tag>", "<relay hint>", "<author pubkey>", "84"]
  ]
}

To populate the e-tags, we need to iterate through the filteredResults and add an e-tag for each result.
The format is: ["e", "<event id>", "<optional relay hint>", "<optional author pubkey>", "<optional weight>"]

The relay hint will be the first relay in aDListRelays. If aDListRelays is empty, then the relay hint will be the empty string.
The author pubkey will be the pubkey of the author of the event.

The final element of each e-tag or a-tag is the stringified trust score of the item.
*/
