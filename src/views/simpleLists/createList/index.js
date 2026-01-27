import React, { useState, useMemo, useEffect } from 'react'
import { useActiveUser, useNewEvent, useSigner, useSubscribe } from 'nostr-hooks'
import Confetti from 'react-confetti'
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormCheck,
  CFormSelect,
  CAlert,
  CBadge,
} from '@coreui/react'

const CreateList = () => {
  const [nameSingular, setNameSingular] = useState('')
  const [namePlural, setNamePlural] = useState('')
  const [description, setDescription] = useState('')
  const [isEditable, setIsEditable] = useState(true)
  const [dTagOption, setDTagOption] = useState('auto')
  const [customDTag, setCustomDTag] = useState('')
  const [constraintTags, setConstraintTags] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [publishStartTime, setPublishStartTime] = useState(null)
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false)
  const [verificationTimer, setVerificationTimer] = useState(0)
  const [eventVerified, setEventVerified] = useState(false)
  const [verificationFailed, setVerificationFailed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const { activeUser } = useActiveUser()
  const { signer } = useSigner()
  const { createNewEvent } = useNewEvent()

  // Debug activeUser
  useEffect(() => {
    console.log('activeUser changed:', activeUser)
  }, [activeUser])

  // Generate automatic d-tag
  const generateAutoDTag = (singular, plural, desc) => {
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

  // Get relay URLs from sessionStorage
  const aDListRelays = useMemo(() => {
    try {
      const relays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')
      console.log('aDListRelays loaded:', relays)
      return relays
    } catch {
      console.log('aDListRelays failed to load, using empty array')
      return []
    }
  }, [])

  // Calculate event kind directly from form state
  const eventKind = isEditable ? 39998 : 9998

  // Subscribe to verify published event using pubkey + kind + since
  const verificationFilter = useMemo(() => {
    // Only create filter if we have all required data AND user is actually logged in
    if (!publishStartTime || !activeUser?.pubkey || !isWaitingForVerification) {
      console.log('verificationFilter: null - missing data:', {
        publishStartTime,
        pubkey: activeUser?.pubkey,
        eventKind,
        isWaitingForVerification,
        activeUserFull: activeUser,
      })
      return null
    }

    const filter = {
      authors: [activeUser.pubkey],
      kinds: [eventKind],
      since: publishStartTime - 30, // 30 seconds before publish attempt
      limit: 5, // Get a few recent events to be safe
    }
    console.log('verificationFilter created:', filter)
    return filter
  }, [publishStartTime, activeUser?.pubkey, eventKind, isWaitingForVerification])

  const subscribeParams = useMemo(() => {
    const params = {
      filters: verificationFilter ? [verificationFilter] : [],
      relays: aDListRelays,
      enabled: !!publishStartTime && isWaitingForVerification,
    }
    console.log('useSubscribe params:', params)
    return params
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
    console.log('Verification events received:', verificationEvents)
    console.log('Is waiting for verification:', isWaitingForVerification)

    if (verificationEvents && verificationEvents.length > 0 && isWaitingForVerification) {
      console.log('Event verified successfully!', verificationEvents[0])
      setEventVerified(true)
      setIsWaitingForVerification(false)
      setShowConfetti(true)
      setVerificationTimer(0)

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    } else if (isWaitingForVerification) {
      console.log('Still waiting for verification... Timer:', verificationTimer)
    }
  }, [verificationEvents, isWaitingForVerification, verificationTimer])

  const autoDTag = useMemo(() => {
    return generateAutoDTag(nameSingular, namePlural, description)
  }, [nameSingular, namePlural, description])

  const finalDTag = dTagOption === 'auto' ? autoDTag : customDTag

  // Build event tags
  const buildEventTags = () => {
    const tags = []

    // Names tag (required)
    tags.push(['names', nameSingular, namePlural])

    // Description tag (optional)
    if (description.trim()) {
      tags.push(['description', description.trim()])
    }

    // D tag (for replaceable events)
    if (isEditable && finalDTag) {
      tags.push(['d', finalDTag])
    }

    // Constraint tags
    constraintTags.forEach((tag) => {
      const tagName = tag.tagName === 'custom' ? tag.customTagName : tag.tagName
      if (tagName.trim()) {
        tags.push([tag.constraintType, tagName.trim()])
      }
    })

    return tags
  }

  // Build preview event
  const previewEvent = useMemo(() => {
    if (!nameSingular || !namePlural) return null

    return {
      kind: isEditable ? 39998 : 9998,
      pubkey: activeUser?.pubkey || '',
      tags: buildEventTags(),
      content: '',
      created_at: Math.floor(Date.now() / 1000),
    }
  }, [nameSingular, namePlural, description, isEditable, finalDTag, constraintTags, activeUser])

  // Check if form is valid for publishing
  const isFormValid = () => {
    if (!nameSingular.trim() || !namePlural.trim()) return false
    if (isEditable && dTagOption === 'custom' && !customDTag.trim()) return false
    return true
  }

  // Reset form function
  const resetForm = () => {
    setNameSingular('')
    setNamePlural('')
    setDescription('')
    setIsEditable(true)
    setDTagOption('auto')
    setCustomDTag('')
    setConstraintTags([])
    setShowPreview(false)
    setPublishStartTime(null)
    setIsWaitingForVerification(false)
    setVerificationTimer(0)
    setEventVerified(false)
    setVerificationFailed(false)
    setShowConfetti(false)
  }

  // Publish new list
  const publishNewList = () => {
    if (!isFormValid() || !previewEvent) return

    // Check if user is logged in before publishing
    if (!activeUser?.pubkey) {
      console.error('Cannot publish: User not logged in or pubkey not available')
      alert('Please make sure you are logged in before publishing a list.')
      return
    }

    const eventToPublish = createNewEvent()
    eventToPublish.kind = previewEvent.kind
    eventToPublish.tags = previewEvent.tags
    eventToPublish.content = previewEvent.content

    // Record publish start time for verification
    const publishTime = Math.floor(Date.now() / 1000)
    console.log('Starting publish at timestamp:', publishTime, 'for user:', activeUser.pubkey)
    setPublishStartTime(publishTime)
    setIsWaitingForVerification(true)
    setVerificationTimer(0)
    setEventVerified(false)
    setVerificationFailed(false)

    // Sign and publish the event
    signer.sign(eventToPublish)
    console.log('Publishing new list:', JSON.stringify(eventToPublish, null, 2))
    eventToPublish.publish()
  }

  // Add constraint tag
  const addConstraintTag = () => {
    setConstraintTags([
      ...constraintTags,
      { constraintType: 'required', tagName: 'custom', customTagName: '' },
    ])
  }

  // Remove constraint tag
  const removeConstraintTag = (index) => {
    setConstraintTags(constraintTags.filter((_, i) => i !== index))
  }

  // Update constraint tag
  const updateConstraintTag = (index, field, value) => {
    const updated = [...constraintTags]
    updated[index] = { ...updated[index], [field]: value }
    setConstraintTags(updated)
  }

  return (
    <CContainer style={{ padding: '20px', maxWidth: '800px' }}>
      <center>
        <h2 style={{ marginBottom: '30px' }}>Create New List</h2>
      </center>

      <CForm>
        {/* Basic Information */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <CCardTitle>Basic Information</CCardTitle>

            <CRow className="mb-3">
              <CCol md="6">
                <CFormLabel htmlFor="nameSingular">Name for one list item (singular) *</CFormLabel>
                <CFormInput
                  id="nameSingular"
                  value={nameSingular}
                  onChange={(e) => setNameSingular(e.target.value)}
                  placeholder="e.g., Person"
                  required
                />
              </CCol>
              <CCol md="6">
                <CFormLabel htmlFor="namePlural">
                  Name for multiple list items (plural) *
                </CFormLabel>
                <CFormInput
                  id="namePlural"
                  value={namePlural}
                  onChange={(e) => setNamePlural(e.target.value)}
                  placeholder="e.g., People"
                  required
                />
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel htmlFor="description">Description (optional)</CFormLabel>
              <CFormTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this list is for..."
                rows="3"
              />
            </div>

            <div className="mb-3">
              <CFormCheck
                id="isEditable"
                checked={isEditable}
                onChange={(e) => setIsEditable(e.target.checked)}
                label="Editable (allows updates to the list)"
              />
              <small className="text-muted">
                Editable lists use kind 39998, non-editable use kind 9998
              </small>
            </div>
          </CCardBody>
        </CCard>

        {/* D Tag Section (only for editable lists) */}
        {isEditable && (
          <CCard style={{ marginBottom: '20px' }}>
            <CCardBody>
              <CCardTitle>D Tag Configuration</CCardTitle>

              <div className="mb-3">
                <CFormCheck
                  type="radio"
                  name="dTagOption"
                  id="autoDTag"
                  checked={dTagOption === 'auto'}
                  onChange={() => setDTagOption('auto')}
                  label="Automatically generated d tag (recommended)"
                />
                <CFormCheck
                  type="radio"
                  name="dTagOption"
                  id="customDTag"
                  checked={dTagOption === 'custom'}
                  onChange={() => setDTagOption('custom')}
                  label="Custom d tag"
                />
              </div>

              {dTagOption === 'auto' && (
                <div className="mb-3">
                  <CFormLabel>Generated D Tag:</CFormLabel>
                  <CFormInput value={autoDTag} readOnly />
                  <small className="text-muted">
                    This tag is automatically generated based on your input fields and will update
                    as you type.
                  </small>
                </div>
              )}

              {dTagOption === 'custom' && (
                <>
                  <div className="mb-3">
                    <CFormLabel htmlFor="customDTagInput">Custom D Tag *</CFormLabel>
                    <CFormInput
                      id="customDTagInput"
                      value={customDTag}
                      onChange={(e) => setCustomDTag(e.target.value.replace(/\s/g, ''))}
                      placeholder="my-unique-tag"
                      required
                    />
                  </div>
                  <CAlert color="info">
                    <strong>Important:</strong> Replaceable (addressable) events are addressed using
                    the event kind, the author pubkey, and the d tag. You must select a unique d
                    tag; otherwise you will overwrite any prior events with matching address. They
                    can be human readable (my-cool-da-tag) or not (e.g., random characters). Spaces
                    are not allowed.
                  </CAlert>
                </>
              )}
            </CCardBody>
          </CCard>
        )}

        {/* Constraint Tags */}
        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <CCardTitle>Constraint Tags (Optional)</CCardTitle>
            <p className="text-muted">
              Define what information is expected in the tags of list item events.
            </p>

            {constraintTags.map((tag, index) => (
              <CRow key={index} className="mb-3 align-items-end">
                <CCol md="4">
                  <CFormLabel>Constraint Type</CFormLabel>
                  <CFormSelect
                    value={tag.constraintType}
                    onChange={(e) => updateConstraintTag(index, 'constraintType', e.target.value)}
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                    <option value="allowed">Allowed</option>
                    <option value="recommended">Recommended</option>
                    <option value="disallowed">Disallowed</option>
                  </CFormSelect>
                </CCol>
                <CCol md="3">
                  <CFormLabel>Tag Type</CFormLabel>
                  <CFormSelect
                    value={tag.tagName}
                    onChange={(e) => updateConstraintTag(index, 'tagName', e.target.value)}
                  >
                    <option value="custom">Custom</option>
                    <option value="p">p (pubkey)</option>
                    <option value="e">e (event id)</option>
                    <option value="a">a (aTag/naddr)</option>
                    <option value="t">t (text/hashtag)</option>
                  </CFormSelect>
                </CCol>
                {tag.tagName === 'custom' && (
                  <CCol md="3">
                    <CFormLabel>Custom Tag Name</CFormLabel>
                    <CFormInput
                      value={tag.customTagName}
                      onChange={(e) => updateConstraintTag(index, 'customTagName', e.target.value)}
                      placeholder="custom tag name"
                    />
                  </CCol>
                )}
                <CCol md="2">
                  <CButton color="danger" size="sm" onClick={() => removeConstraintTag(index)}>
                    Remove
                  </CButton>
                </CCol>
              </CRow>
            ))}

            <CButton color="secondary" size="sm" onClick={addConstraintTag}>
              Add Constraint Tag
            </CButton>

            {constraintTags.length > 0 && (
              <div className="mt-3">
                <strong>Preview:</strong>
                <div>
                  {constraintTags.map((tag, index) => (
                    <CBadge key={index} color="info" className="me-2 mb-1">
                      {tag.constraintType}:{' '}
                      {tag.tagName === 'custom' ? tag.customTagName : tag.tagName}
                    </CBadge>
                  ))}
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>

        {/* Control Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <CButton
            color="secondary"
            size="sm"
            style={{ marginRight: '10px' }}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Preview'} Raw Event
          </CButton>
          <CButton
            color="primary"
            disabled={!isFormValid() || !activeUser?.pubkey}
            onClick={publishNewList}
          >
            Publish New List
          </CButton>
        </div>

        {/* Login Required Message */}
        {!activeUser?.pubkey && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <CAlert color="warning" style={{ display: 'inline-block', margin: '0 auto' }}>
              <strong>⚠️ You must log in before publishing a new list.</strong>
            </CAlert>
          </div>
        )}

        {/* Preview Raw Event */}
        {showPreview && previewEvent && (
          <CCard>
            <CCardBody>
              <CCardTitle>Raw Event Preview</CCardTitle>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  fontSize: '0.9em',
                }}
              >
                {JSON.stringify(previewEvent, null, 2)}
              </pre>
            </CCardBody>
          </CCard>
        )}

        {/* Verification Status */}
        {isWaitingForVerification && (
          <CCard style={{ marginTop: '20px' }}>
            <CCardBody style={{ textAlign: 'center' }}>
              <CCardTitle>Waiting for Verification...</CCardTitle>
              <p>We are waiting for confirmation that your event was published successfully.</p>
              <p>
                <strong>Time elapsed: {verificationTimer} seconds</strong>
              </p>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </CCardBody>
          </CCard>
        )}

        {/* Success Message */}
        {eventVerified && (
          <CCard style={{ marginTop: '20px', borderColor: '#28a745' }}>
            <CCardBody style={{ textAlign: 'center', backgroundColor: '#d4edda' }}>
              <CCardTitle style={{ color: '#155724' }}>🎉 Success!</CCardTitle>
              <p style={{ color: '#155724' }}>Your list has been published successfully!</p>
              <p style={{ color: '#155724' }}>Ready to create a new list?</p>
              <CButton color="success" onClick={resetForm}>
                Yes, Create Another List
              </CButton>
            </CCardBody>
          </CCard>
        )}

        {/* Verification Failed */}
        {verificationFailed && (
          <CCard style={{ marginTop: '20px', borderColor: '#dc3545' }}>
            <CCardBody style={{ textAlign: 'center', backgroundColor: '#f8d7da' }}>
              <CCardTitle style={{ color: '#721c24' }}>⚠️ Verification Timeout</CCardTitle>
              <p style={{ color: '#721c24' }}>
                We couldn&apos;t verify that your event was published within 30 seconds.
              </p>
              <p style={{ color: '#721c24' }}>
                This doesn&apos;t necessarily mean it failed - it might just be taking longer than
                expected.
              </p>
              <p style={{ color: '#721c24' }}>
                You can check the main List Headers page to see if your list appears there.
              </p>
              <div style={{ marginTop: '15px' }}>
                <CButton
                  color="primary"
                  onClick={() => (window.location.href = '#/simpleLists/viewLists')}
                  style={{ marginRight: '10px' }}
                >
                  Go to List Headers
                </CButton>
                <CButton color="secondary" onClick={resetForm}>
                  Try Creating Another List
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        )}
      </CForm>

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </CContainer>
  )
}

export default CreateList
