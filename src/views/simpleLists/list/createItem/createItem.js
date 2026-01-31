import React, { useState, useMemo, useEffect } from 'react'
import { useNewEvent, useSigner, useSubscribe } from 'nostr-hooks'
import Confetti from 'react-confetti'
import { nip19 } from 'nostr-tools'
import {
  CButton,
  CContainer,
  CCard,
  CCardBody,
  CCardTitle,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormCheck,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react'

const CreateItem = ({ activeUser, event, zTag }) => {
  // Basic configuration
  const [isEditable, setIsEditable] = useState(true)
  const [dTagOption, setDTagOption] = useState('auto')
  const [customDTag, setCustomDTag] = useState('')

  // Item content tags (p/e/t/a)
  const [pTag, setPTag] = useState('')
  const [eTag, setETag] = useState('')
  const [tTag, setTTag] = useState('')
  const [aTag, setATag] = useState('')

  // Informational tags
  const [nameTag, setNameTag] = useState('')
  const [titleTag, setTitleTag] = useState('')
  const [slugTag, setSlugTag] = useState('')
  const [descriptionTag, setDescriptionTag] = useState('')
  const [commentsTag, setCommentsTag] = useState('')

  // Custom tags
  const [customTags, setCustomTags] = useState([])

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [publishStartTime, setPublishStartTime] = useState(null)
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [eventVerified, setEventVerified] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({})

  const { signer } = useSigner()
  const { createNewEvent } = useNewEvent()

  // Get relay URLs from sessionStorage
  const aDListRelays = useMemo(() => {
    try {
      const relays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')
      return relays
    } catch {
      return []
    }
  }, [])

  // Parse list header constraints
  const constraints = useMemo(() => {
    if (!event || !event.tags) return { required: [], allowed: [], recommended: [], disallowed: [] }

    const result = { required: [], allowed: [], recommended: [], disallowed: [] }

    event.tags.forEach((tag) => {
      const [tagType, ...values] = tag
      if (tagType === 'required') {
        result.required.push(...values)
      } else if (tagType === 'allowed') {
        result.allowed.push(...values)
      } else if (tagType === 'recommended') {
        result.recommended.push(...values)
      } else if (tagType === 'disallowed') {
        result.disallowed.push(...values)
      }
    })

    return result
  }, [event])

  // Helper to check if a tag is allowed
  const isTagAllowed = (tagName) => {
    return !constraints.disallowed.includes(tagName)
  }

  // Helper to check if a tag is required
  const isTagRequired = (tagName) => {
    return constraints.required.includes(tagName)
  }

  // Helper to check if a tag should be shown
  const shouldShowTag = (tagName) => {
    return (
      isTagRequired(tagName) ||
      constraints.allowed.includes(tagName) ||
      constraints.recommended.includes(tagName)
    )
  }

  // Generate automatic d-tag
  const generateAutoDTag = () => {
    if (!activeUser?.pubkey) return ''
    const timestamp = Math.floor(Date.now() / 1000)
    const concatenated = `${activeUser.pubkey}${timestamp}`
    let hash = 0
    for (let i = 0; i < concatenated.length; i++) {
      const char = concatenated.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).substring(0, 16)
  }

  const autoDTag = useMemo(() => {
    return generateAutoDTag()
  }, [activeUser?.pubkey, nameTag, titleTag, descriptionTag])

  const finalDTag = dTagOption === 'auto' ? autoDTag : customDTag

  // Validation functions
  const isValidHex = (str, length) => {
    const hexRegex = new RegExp(`^[0-9a-f]{${length}}$`, 'i')
    return hexRegex.test(str)
  }

  const validateAndDecodeNip19 = (input, expectedPrefix) => {
    if (!input.trim()) return { valid: true, decoded: '' }

    // Try NIP-19 decoding first
    if (input.startsWith(expectedPrefix)) {
      try {
        const decoded = nip19.decode(input)
        if (expectedPrefix === 'npub' && decoded.type === 'npub') {
          return { valid: true, decoded: decoded.data }
        }
        if (expectedPrefix === 'note' && decoded.type === 'note') {
          return { valid: true, decoded: decoded.data }
        }
        if (expectedPrefix === 'nevent' && decoded.type === 'nevent') {
          return { valid: true, decoded: decoded.data.id }
        }
        if (expectedPrefix === 'naddr' && decoded.type === 'naddr') {
          const { kind, pubkey, identifier } = decoded.data
          return { valid: true, decoded: `${kind}:${pubkey}:${identifier}` }
        }
      } catch (e) {
        return { valid: false, decoded: '', error: 'Invalid NIP-19 format' }
      }
    }

    // Check if it's raw hex
    if (expectedPrefix === 'npub' && isValidHex(input, 64)) {
      return { valid: true, decoded: input }
    }
    if ((expectedPrefix === 'note' || expectedPrefix === 'nevent') && isValidHex(input, 64)) {
      return { valid: true, decoded: input }
    }
    if (expectedPrefix === 'naddr') {
      // Check if it's in format kind:pubkey:identifier
      const parts = input.split(':')
      if (parts.length === 3 && !isNaN(parts[0]) && isValidHex(parts[1], 64)) {
        return { valid: true, decoded: input }
      }
    }

    return { valid: false, decoded: '', error: 'Invalid format' }
  }

  // Validate all inputs
  const validateInputs = () => {
    const errors = {}

    // Validate p tag
    if (pTag.trim()) {
      const result = validateAndDecodeNip19(pTag, 'npub')
      if (!result.valid) {
        errors.pTag = result.error || 'Invalid pubkey format (use npub or 64-char hex)'
      }
    }

    // Validate e tag
    if (eTag.trim()) {
      const result = validateAndDecodeNip19(eTag, 'note')
      if (!result.valid) {
        errors.eTag = result.error || 'Invalid event ID format (use note/nevent or 64-char hex)'
      }
    }

    // Validate a tag
    if (aTag.trim()) {
      const result = validateAndDecodeNip19(aTag, 'naddr')
      if (!result.valid) {
        errors.aTag = result.error || 'Invalid naddr format (use naddr or kind:pubkey:identifier)'
      }
    }

    // Validate custom d-tag (no spaces)
    if (dTagOption === 'custom' && customDTag.trim()) {
      if (customDTag.includes(' ')) {
        errors.customDTag = 'D-tag cannot contain spaces'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Build event tags - memoized to prevent infinite loops
  const eventTags = useMemo(() => {
    const tags = []

    // Z tag (required)
    tags.push(['z', zTag])

    // D tag (if editable)
    if (isEditable && finalDTag) {
      tags.push(['d', finalDTag])
    }

    // Item content tags (p/e/t/a) - decode if needed
    if (pTag.trim()) {
      const result = validateAndDecodeNip19(pTag, 'npub')
      if (result.valid && result.decoded) {
        tags.push(['p', result.decoded])
      }
    }

    if (eTag.trim()) {
      const result = validateAndDecodeNip19(eTag, 'note')
      if (result.valid && result.decoded) {
        tags.push(['e', result.decoded])
      }
    }

    if (tTag.trim()) {
      tags.push(['t', tTag.trim()])
    }

    if (aTag.trim()) {
      const result = validateAndDecodeNip19(aTag, 'naddr')
      if (result.valid && result.decoded) {
        tags.push(['a', result.decoded])
      }
    }

    // Informational tags
    if (nameTag.trim() && !constraints.disallowed.includes('name')) {
      tags.push(['name', nameTag.trim()])
    }

    if (titleTag.trim() && !constraints.disallowed.includes('title')) {
      tags.push(['title', titleTag.trim()])
    }

    if (slugTag.trim() && !constraints.disallowed.includes('slug')) {
      tags.push(['slug', slugTag.trim()])
    }

    if (descriptionTag.trim() && !constraints.disallowed.includes('description')) {
      tags.push(['description', descriptionTag.trim()])
    }

    if (commentsTag.trim() && !constraints.disallowed.includes('comments')) {
      tags.push(['comments', commentsTag.trim()])
    }

    // Custom tags
    customTags.forEach((customTag) => {
      if (customTag.tagName.trim() && customTag.tagValue.trim()) {
        tags.push([customTag.tagName.trim(), customTag.tagValue.trim()])
      }
    })

    return tags
  }, [
    zTag,
    isEditable,
    finalDTag,
    pTag,
    eTag,
    tTag,
    aTag,
    nameTag,
    titleTag,
    slugTag,
    descriptionTag,
    commentsTag,
    customTags,
    constraints.disallowed,
  ])

  // Build preview event
  const previewEvent = useMemo(() => {
    // Must have at least z tag and one additional tag
    if (eventTags.length < 2) return null

    return {
      kind: isEditable ? 39999 : 9999,
      pubkey: activeUser?.pubkey || '',
      tags: eventTags,
      content: '',
      created_at: Math.floor(Date.now() / 1000),
    }
  }, [eventTags, isEditable, activeUser?.pubkey])

  // Check if form is valid for publishing - memoized to prevent state updates during render
  const isFormValid = useMemo(() => {
    // Check d-tag requirement
    if (isEditable && dTagOption === 'custom' && !customDTag.trim()) return false

    // Check required fields from list header
    if (isTagRequired('p') && !pTag.trim()) return false
    if (isTagRequired('e') && !eTag.trim()) return false
    if (isTagRequired('t') && !tTag.trim()) return false
    if (isTagRequired('a') && !aTag.trim()) return false
    if (isTagRequired('name') && !nameTag.trim()) return false
    if (isTagRequired('title') && !titleTag.trim()) return false
    if (isTagRequired('slug') && !slugTag.trim()) return false
    if (isTagRequired('description') && !descriptionTag.trim()) return false
    if (isTagRequired('comments') && !commentsTag.trim()) return false

    // Must have at least one additional tag beyond z (and d if editable)
    const minTags = isEditable ? 3 : 2 // z + d + 1 more, or z + 1 more
    if (eventTags.length < minTags) return false

    // Check validation errors exist (but don't call validateInputs to avoid state update)
    if (Object.keys(validationErrors).length > 0) return false

    return true
  }, [
    isEditable,
    dTagOption,
    customDTag,
    pTag,
    eTag,
    tTag,
    aTag,
    nameTag,
    titleTag,
    slugTag,
    descriptionTag,
    commentsTag,
    eventTags.length,
    validationErrors,
    constraints.required,
  ])

  // Subscribe to verify published event
  const eventKind = isEditable ? 39999 : 9999

  const verificationFilter = useMemo(() => {
    if (!publishStartTime || !activeUser?.pubkey || !isWaitingForVerification) {
      return null
    }

    return {
      authors: [activeUser.pubkey],
      kinds: [eventKind],
      since: publishStartTime - 30,
      limit: 5,
    }
  }, [publishStartTime, activeUser?.pubkey, eventKind, isWaitingForVerification])

  const subscribeParams = useMemo(() => {
    return {
      filters: verificationFilter ? [verificationFilter] : [],
      relays: aDListRelays,
      enabled: !!publishStartTime && isWaitingForVerification,
    }
  }, [verificationFilter, aDListRelays, publishStartTime, isWaitingForVerification])

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

  // Calculate remaining seconds for verification timer
  const remainingSeconds = 30 - verificationTimer

  // Publish new list item
  const publishNewListItem = () => {
    if (!isFormValid || !previewEvent) return

    if (!activeUser?.pubkey) {
      alert('Please make sure you are logged in before publishing.')
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

  // Custom tag management
  const addCustomTag = () => {
    setCustomTags([...customTags, { tagName: '', tagValue: '' }])
  }

  const removeCustomTag = (index) => {
    setCustomTags(customTags.filter((_, i) => i !== index))
  }

  const updateCustomTag = (index, field, value) => {
    const updated = [...customTags]
    updated[index] = { ...updated[index], [field]: value }
    setCustomTags(updated)
  }

  return (
    <CContainer style={{ padding: '20px', maxWidth: '800px' }}>
      {showConfetti && <Confetti />}

      <CForm>
        {/* Basic Configuration */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <CCardTitle>Basic Configuration</CCardTitle>

            <div className="mb-3">
              <CFormCheck
                id="isEditable"
                checked={isEditable}
                onChange={(e) => setIsEditable(e.target.checked)}
                label="Editable (allows updates to this list item)"
              />
              <small className="text-muted">
                Editable items use kind 39999, non-editable use kind 9999
              </small>
            </div>

            {/* D Tag Section (only for editable items) */}
            {isEditable && (
              <>
                <div className="mb-3">
                  <CFormCheck
                    type="radio"
                    name="dTagOption"
                    id="autoDTag"
                    checked={dTagOption === 'auto'}
                    onChange={() => setDTagOption('auto')}
                    label="Automatically generated d-tag (recommended)"
                  />
                  {dTagOption === 'auto' && (
                    <small className="text-muted d-block ms-4">
                      Generated d-tag: <code>{autoDTag}</code>
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <CFormCheck
                    type="radio"
                    name="dTagOption"
                    id="customDTag"
                    checked={dTagOption === 'custom'}
                    onChange={() => setDTagOption('custom')}
                    label="Custom d-tag"
                  />
                  {dTagOption === 'custom' && (
                    <>
                      <CFormInput
                        className="mt-2 ms-4"
                        value={customDTag}
                        onChange={(e) => setCustomDTag(e.target.value)}
                        placeholder="my-custom-dtag"
                        invalid={!!validationErrors.customDTag}
                      />
                      {validationErrors.customDTag && (
                        <small className="text-danger ms-4">{validationErrors.customDTag}</small>
                      )}
                      <CAlert color="info" className="mt-2 ms-4">
                        <small>
                          Replaceable (addressable) events are addressed using the event kind, the
                          author pubkey, and the d-tag. You must select a unique d-tag; otherwise
                          you will overwrite any prior events with matching address. They can be
                          human readable (my-cool-d-tag) or not. Spaces are not allowed.
                        </small>
                      </CAlert>
                    </>
                  )}
                </div>
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Item Content Tags */}
        {(shouldShowTag('p') || shouldShowTag('e') || shouldShowTag('t') || shouldShowTag('a')) && (
          <CCard style={{ marginBottom: '20px' }}>
            <CCardBody>
              <CCardTitle>Item Content Tags</CCardTitle>
              <p className="text-muted">
                Specify the content this list item refers to. Supports NIP-19 encoding (npub, note,
                nevent, naddr) or raw hex.
              </p>

              {shouldShowTag('p') && (
                <div className="mb-3">
                  <CFormLabel htmlFor="pTag">
                    Pubkey (p tag) {isTagRequired('p') && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    id="pTag"
                    value={pTag}
                    onChange={(e) => setPTag(e.target.value)}
                    placeholder="npub... or hex pubkey"
                    invalid={!!validationErrors.pTag}
                  />
                  {validationErrors.pTag && (
                    <small className="text-danger">{validationErrors.pTag}</small>
                  )}
                </div>
              )}

              {shouldShowTag('e') && (
                <div className="mb-3">
                  <CFormLabel htmlFor="eTag">
                    Event ID (e tag) {isTagRequired('e') && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    id="eTag"
                    value={eTag}
                    onChange={(e) => setETag(e.target.value)}
                    placeholder="note... or nevent... or hex event ID"
                    invalid={!!validationErrors.eTag}
                  />
                  {validationErrors.eTag && (
                    <small className="text-danger">{validationErrors.eTag}</small>
                  )}
                </div>
              )}

              {shouldShowTag('t') && (
                <div className="mb-3">
                  <CFormLabel htmlFor="tTag">
                    Text/Hashtag (t tag){' '}
                    {isTagRequired('t') && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    id="tTag"
                    value={tTag}
                    onChange={(e) => setTTag(e.target.value)}
                    placeholder="Enter text or hashtag"
                  />
                </div>
              )}

              {shouldShowTag('a') && (
                <div className="mb-3">
                  <CFormLabel htmlFor="aTag">
                    Address/Naddr (a tag){' '}
                    {isTagRequired('a') && <span className="text-danger">*</span>}
                  </CFormLabel>
                  <CFormInput
                    id="aTag"
                    value={aTag}
                    onChange={(e) => setATag(e.target.value)}
                    placeholder="naddr... or kind:pubkey:identifier"
                    invalid={!!validationErrors.aTag}
                  />
                  {validationErrors.aTag && (
                    <small className="text-danger">{validationErrors.aTag}</small>
                  )}
                </div>
              )}
            </CCardBody>
          </CCard>
        )}

        {/* Informational Tags */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <CCardTitle>Informational Tags (Optional)</CCardTitle>

            {isTagAllowed('name') && (
              <div className="mb-3">
                <CFormLabel htmlFor="nameTag">
                  Name {isTagRequired('name') && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormInput
                  id="nameTag"
                  value={nameTag}
                  onChange={(e) => setNameTag(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
            )}

            {isTagAllowed('title') && (
              <div className="mb-3">
                <CFormLabel htmlFor="titleTag">
                  Title {isTagRequired('title') && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormInput
                  id="titleTag"
                  value={titleTag}
                  onChange={(e) => setTitleTag(e.target.value)}
                  placeholder="Enter title"
                />
              </div>
            )}

            {isTagAllowed('slug') && (
              <div className="mb-3">
                <CFormLabel htmlFor="slugTag">
                  Slug {isTagRequired('slug') && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormInput
                  id="slugTag"
                  value={slugTag}
                  onChange={(e) => setSlugTag(e.target.value)}
                  placeholder="enter-slug"
                />
              </div>
            )}

            {isTagAllowed('description') && (
              <div className="mb-3">
                <CFormLabel htmlFor="descriptionTag">
                  Description{' '}
                  {isTagRequired('description') && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormTextarea
                  id="descriptionTag"
                  value={descriptionTag}
                  onChange={(e) => setDescriptionTag(e.target.value)}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
            )}

            {isTagAllowed('comments') && (
              <div className="mb-3">
                <CFormLabel htmlFor="commentsTag">
                  Comments {isTagRequired('comments') && <span className="text-danger">*</span>}
                </CFormLabel>
                <CFormTextarea
                  id="commentsTag"
                  value={commentsTag}
                  onChange={(e) => setCommentsTag(e.target.value)}
                  placeholder="Enter comments"
                  rows="3"
                />
              </div>
            )}
          </CCardBody>
        </CCard>

        {/* Custom Tags */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <CCardTitle>Custom Tags</CCardTitle>
            <p className="text-muted">Add custom tags with your own tag names and values.</p>

            {customTags.map((customTag, index) => (
              <CRow key={index} className="mb-2">
                <CCol md="5">
                  <CFormInput
                    value={customTag.tagName}
                    onChange={(e) => updateCustomTag(index, 'tagName', e.target.value)}
                    placeholder="Tag name"
                  />
                </CCol>
                <CCol md="5">
                  <CFormInput
                    value={customTag.tagValue}
                    onChange={(e) => updateCustomTag(index, 'tagValue', e.target.value)}
                    placeholder="Tag value"
                  />
                </CCol>
                <CCol md="2">
                  <CButton color="danger" size="sm" onClick={() => removeCustomTag(index)}>
                    Remove
                  </CButton>
                </CCol>
              </CRow>
            ))}

            <CButton color="secondary" size="sm" onClick={addCustomTag}>
              + Add Custom Tag
            </CButton>
          </CCardBody>
        </CCard>

        {/* Preview & Publish */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <div className="d-flex gap-2 mb-3">
              <CButton
                color="secondary"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!previewEvent}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </CButton>
              <CButton
                color="primary"
                onClick={() => publishNewListItem()}
                disabled={!isFormValid || isWaitingForVerification}
              >
                {isWaitingForVerification
                  ? `Publishing... (${remainingSeconds}s)`
                  : 'Publish List Item'}
              </CButton>
            </div>

            {/* Success/Failure Messages */}
            {eventVerified && (
              <CAlert color="success">
                ✅ List item published successfully! Event has been verified on the relays.
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
      </CForm>
    </CContainer>
  )
}

export default CreateItem
