import React, { useState, useEffect, useMemo } from 'react'
import { useActiveUser, useSubscribe } from 'nostr-hooks'
import { CButton, CCard, CCardBody, CAlert } from '@coreui/react'

const TrustedAssertionsSettings = () => {
  const { activeUser } = useActiveUser()
  const [show10040Event, setShow10040Event] = useState(false)
  const [showRankScoreLookup, setShowRankScoreLookup] = useState(false)
  const [decryptionError, setDecryptionError] = useState(null)

  // SessionStorage state
  const [rankTrustedServiceProviderPubkey, setRankTrustedServiceProviderPubkey] = useState(null)
  const [rankNip85Relay, setRankNip85Relay] = useState(null)
  const [rank_score_lookup, setRankScoreLookup] = useState(null)

  // Load from SessionStorage on mount and when activeUser changes
  useEffect(() => {
    const storedProviderPubkey = sessionStorage.getItem('rank_trusted_service_provider_pubkey')
    const storedRelay = sessionStorage.getItem('rank_nip85_relay')
    const storedLookup = sessionStorage.getItem('rank_score_lookup')

    setRankTrustedServiceProviderPubkey(storedProviderPubkey)
    setRankNip85Relay(storedRelay)

    if (storedLookup) {
      try {
        setRankScoreLookup(JSON.parse(storedLookup))
      } catch {
        setRankScoreLookup(null)
      }
    }
  }, [activeUser])

  // Get relays for fetching 10040 event
  const aPopularGeneralPurposeRelays = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('aPopularGeneralPurposeRelays') || '[]')
    } catch {
      return []
    }
  }, [])

  // Filter for fetching the active user's kind 10040 event
  const event10040Filter = useMemo(() => {
    if (!activeUser?.pubkey) return null
    return [{ kinds: [10040], authors: [activeUser.pubkey] }]
  }, [activeUser?.pubkey])

  const { events: events10040 } = useSubscribe({
    filters: event10040Filter || [],
    relays: aPopularGeneralPurposeRelays,
    enabled: !!event10040Filter && aPopularGeneralPurposeRelays.length > 0,
  })

  // Extract the 10040 event (most recent if multiple)
  const event10040 = useMemo(() => {
    if (!events10040 || events10040.length === 0) return null
    const sorted = [...events10040].sort((a, b) => b.created_at - a.created_at)
    const e = sorted[0]
    return {
      id: e.id,
      kind: e.kind,
      pubkey: e.pubkey,
      tags: e.tags,
      created_at: e.created_at,
      content: e.content,
      sig: e.sig,
    }
  }, [events10040])

  // Calculate "how long ago" rank_score_lookup was reset
  const getTimeAgoString = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`
  }

  // Count rank scores in rank_score_lookup
  const rankScoreCount = useMemo(() => {
    if (!rank_score_lookup || !rank_score_lookup.rank) return 0
    return Object.keys(rank_score_lookup.rank).length
  }, [rank_score_lookup])

  // Reset rank_score_lookup (for logged-in user)
  const handleResetRankScoreLookup = () => {
    if (!activeUser?.pubkey) return
    const newLookup = {
      pk_active: activeUser.pubkey,
      lastReset: Date.now(),
      rank: {
        [activeUser.pubkey]: 100,
      },
    }
    sessionStorage.setItem('rank_score_lookup', JSON.stringify(newLookup))
    setRankScoreLookup(newLookup)
  }

  // Reset 10040 settings (set provider pubkey and relay to null)
  const handleReset10040 = () => {
    sessionStorage.setItem('rank_trusted_service_provider_pubkey', 'null')
    sessionStorage.setItem('rank_nip85_relay', 'null')
    setRankTrustedServiceProviderPubkey('null')
    setRankNip85Relay('null')
  }

  // Download 10040: extract rank provider info from the 10040 event
  const handleDownload10040 = () => {
    setDecryptionError(null)

    if (!event10040) {
      setDecryptionError('No kind 10040 event found for the active user.')
      return
    }

    // Look for 30382:rank tag in event.tags
    // Format: ["30382:rank", "<provider_pubkey>", "<relay_url>"]
    let providerPubkey = null
    let relayUrl = null

    // First check tags (public declarations)
    const rankTag = event10040.tags.find((tag) => tag[0] === '30382:rank')
    if (rankTag) {
      providerPubkey = rankTag[1] || null
      relayUrl = rankTag[2] || null
    }

    // If not found in tags and content is not empty, try to decrypt
    if (!rankTag && event10040.content && event10040.content.trim() !== '') {
      // For now, we'll note that decryption would be needed
      // Full NIP-44 decryption requires signer integration
      setDecryptionError(
        'The 30382:rank tag was not found in public tags. The content may be encrypted. Decryption of encrypted Trusted Assertion events is not yet implemented.',
      )
    }

    // Validate relay URL
    if (relayUrl && !relayUrl.startsWith('wss://') && !relayUrl.startsWith('ws://')) {
      relayUrl = null
    }

    // Store in SessionStorage
    sessionStorage.setItem(
      'rank_trusted_service_provider_pubkey',
      providerPubkey ? providerPubkey : 'null',
    )
    sessionStorage.setItem('rank_nip85_relay', relayUrl ? relayUrl : 'null')

    setRankTrustedServiceProviderPubkey(providerPubkey ? providerPubkey : 'null')
    setRankNip85Relay(relayUrl ? relayUrl : 'null')
  }

  const isLoggedIn = !!activeUser?.pubkey

  return (
    <>
      <center>
        <h3>Trusted Assertions Settings</h3>
      </center>
      <div style={{ padding: '20px' }}>
        {decryptionError && (
          <CAlert color="warning" dismissible onClose={() => setDecryptionError(null)}>
            {decryptionError}
          </CAlert>
        )}

        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <h5>Active User</h5>
            <p>
              <strong>Pubkey:</strong> {activeUser?.pubkey || <em>Not logged in</em>}
            </p>
          </CCardBody>
        </CCard>

        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <h5>Kind 10040 Event</h5>
            <CButton
              color="info"
              size="sm"
              onClick={() => setShow10040Event(!show10040Event)}
              style={{ marginBottom: '10px' }}
              disabled={!event10040}
            >
              {show10040Event ? 'Hide Raw Event' : 'Show Raw Event'}
            </CButton>
            {!event10040 && (
              <p>
                <em>No kind 10040 event found for the active user.</em>
              </p>
            )}
            {show10040Event && event10040 && (
              <pre
                style={{
                  maxHeight: '400px',
                  overflow: 'scroll',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {JSON.stringify(event10040, null, 2)}
              </pre>
            )}
          </CCardBody>
        </CCard>

        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <h5>Rank Provider Settings</h5>
            <p>
              <strong>rank_trusted_service_provider_pubkey:</strong>{' '}
              <span style={{ wordBreak: 'break-all' }}>
                {rankTrustedServiceProviderPubkey || <em>Not set</em>}
              </span>
            </p>
            <p>
              <strong>rank_nip85_relay:</strong>{' '}
              <span style={{ wordBreak: 'break-all' }}>{rankNip85Relay || <em>Not set</em>}</span>
            </p>
          </CCardBody>
        </CCard>

        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <h5>Rank Score Lookup</h5>
            <p>
              <strong>Last Reset:</strong>{' '}
              {rank_score_lookup?.lastReset ? (
                getTimeAgoString(rank_score_lookup.lastReset)
              ) : (
                <em>Never</em>
              )}
            </p>
            <p>
              <strong>Number of Rank Scores:</strong> {rankScoreCount}
            </p>
            <CButton
              color="info"
              size="sm"
              onClick={() => setShowRankScoreLookup(!showRankScoreLookup)}
              style={{ marginBottom: '10px' }}
              disabled={!rank_score_lookup}
            >
              {showRankScoreLookup ? 'Hide Raw JSON' : 'Show Raw JSON'}
            </CButton>
            {showRankScoreLookup && rank_score_lookup && (
              <pre
                style={{
                  maxHeight: '400px',
                  overflow: 'scroll',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {JSON.stringify(rank_score_lookup, null, 2)}
              </pre>
            )}
          </CCardBody>
        </CCard>

        <CCard style={{ marginBottom: '20px' }}>
          <CCardBody>
            <h5>Actions</h5>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <CButton
                color="primary"
                onClick={handleResetRankScoreLookup}
                disabled={!isLoggedIn}
                title={!isLoggedIn ? 'Login required' : ''}
              >
                Reset Trusted Assertion Settings
              </CButton>
              <CButton
                color="warning"
                onClick={handleReset10040}
                disabled={!isLoggedIn}
                title={!isLoggedIn ? 'Login required' : ''}
              >
                Reset 10040
              </CButton>
              <CButton
                color="success"
                onClick={handleDownload10040}
                disabled={!isLoggedIn}
                title={!isLoggedIn ? 'Login required' : ''}
              >
                Download 10040
              </CButton>
            </div>
            {!isLoggedIn && (
              <p style={{ marginTop: '10px', color: '#888' }}>
                <em>Login to enable these actions.</em>
              </p>
            )}
          </CCardBody>
        </CCard>
      </div>
    </>
  )
}

export default TrustedAssertionsSettings
