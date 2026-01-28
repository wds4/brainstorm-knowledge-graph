import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useActiveUser, useSubscribe } from 'nostr-hooks'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
} from '@coreui/react'
import defaults from 'src/views/settings/parameters/defaults.json'

const ViewCuration = ({ activeUser, event, uuid, uuidType }) => {

  // Simple counter to trigger re-render after processing trusted assertions
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Get relays from SessionStorage
  const aDListRelays = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')
    } catch {
      return []
    }
  }, [])

  // Get trustScoreCutoff from SessionStorage or defaults
  const trustScoreCutoff = useMemo(() => {
    const stored = sessionStorage.getItem('trustScoreCutoff')
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      return isNaN(parsed) ? defaults.trustScoreCutoff : parsed
    }
    return defaults.trustScoreCutoff
  }, [])

  // Get rank provider settings from SessionStorage
  const rankNip85Relay = useMemo(() => {
    const stored = sessionStorage.getItem('rank_nip85_relay')
    if (
      stored &&
      stored !== 'null' &&
      (stored.startsWith('wss://') || stored.startsWith('ws://'))
    ) {
      return stored
    }
    return null
  }, [])

  const rankTrustedServiceProviderPubkey = useMemo(() => {
    const stored = sessionStorage.getItem('rank_trusted_service_provider_pubkey')
    if (stored && stored !== 'null') {
      return stored
    }
    return null
  }, [])

  // Build filter based on uuidType
  const reactionFilter = useMemo(() => {
    if (uuidType === 'aTag') {
      // For aTag items, search by both #a (the aTag) and #e (the event id)
      const filters = [{ kinds: [7], '#a': [uuid] }]
      if (event?.id) {
        filters.push({ kinds: [7], '#e': [event.id] })
      }
      return filters
    } else if (uuidType === 'eventId') {
      return [{ kinds: [7], '#e': [uuid] }]
    }
    return null
  }, [uuid, uuidType, event?.id])

  // Fetch kind 7 reactions
  const { events: reactions } = useSubscribe({
    filters: reactionFilter || [],
    relays: aDListRelays,
    enabled: !!reactionFilter && aDListRelays.length > 0,
  })

  // Filter valid reactions (content is "+" or "-"), deduplicate by author (keep most recent), and sort
  const validReactions = useMemo(() => {
    if (!reactions) return []

    // Filter to only valid reactions
    const valid = reactions.filter((r) => r.content === '+' || r.content === '-')

    // Sort by created_at descending (most recent first)
    valid.sort((a, b) => b.created_at - a.created_at)

    // Deduplicate by author, keeping only the most recent reaction per author
    const seenAuthors = new Set()
    const deduplicated = []
    for (const reaction of valid) {
      if (!seenAuthors.has(reaction.pubkey)) {
        seenAuthors.add(reaction.pubkey)
        deduplicated.push(reaction)
      }
    }

    return deduplicated
  }, [reactions])

  // Get list item author pubkey from the event
  const listItemAuthorPubkey = event?.pubkey || null

  // Helper to get Trust Score from rank_score_lookup (reads from SessionStorage)
  const getTrustScoreFromStorage = (pubkey) => {
    if (activeUser?.pubkey && pubkey === activeUser.pubkey) {
      return 100
    }
    try {
      const stored = sessionStorage.getItem('rank_score_lookup')
      if (!stored) return null
      const lookup = JSON.parse(stored)
      if (activeUser?.pubkey && lookup.pk_active !== activeUser.pubkey) {
        return null
      }
      if (lookup.rank && typeof lookup.rank[pubkey] === 'number') {
        return lookup.rank[pubkey]
      }
      return null
    } catch {
      return null
    }
  }

  // Collect all pubkeys that need Trust Score lookup
  const pubkeysToLookup = useMemo(() => {
    const pubkeys = new Set()
    if (listItemAuthorPubkey) {
      pubkeys.add(listItemAuthorPubkey)
    }
    validReactions.forEach((r) => {
      if (r.pubkey) {
        pubkeys.add(r.pubkey)
      }
    })
    return Array.from(pubkeys)
  }, [listItemAuthorPubkey, validReactions])

  // Helper to update rank_score_lookup in SessionStorage
  const updateRankScoreLookup = (pubkey, score) => {
    try {
      const stored = sessionStorage.getItem('rank_score_lookup')
      let lookup = stored
        ? JSON.parse(stored)
        : { pk_active: activeUser?.pubkey || null, lastReset: Date.now(), rank: {} }
      if (!lookup.rank) lookup.rank = {}
      lookup.rank[pubkey] = score
      sessionStorage.setItem('rank_score_lookup', JSON.stringify(lookup))
    } catch {
      // Ignore errors
    }
  }

  // Filter for fetching kind 30382 Trusted Assertions for pubkeys we don't have scores for
  const pubkeysNeedingLookup = useMemo(() => {
    return pubkeysToLookup.filter((pk) => {
      if (activeUser?.pubkey && pk === activeUser.pubkey) return false
      const storedScore = getTrustScoreFromStorage(pk)
      if (typeof storedScore === 'number') return false
      return true
    })
  }, [pubkeysToLookup, activeUser?.pubkey])

  // Build filter for kind 30382 events
  const trustedAssertionFilter = useMemo(() => {
    if (!rankTrustedServiceProviderPubkey || !rankNip85Relay || pubkeysNeedingLookup.length === 0) {
      return null
    }
    return [
      {
        kinds: [30382],
        authors: [rankTrustedServiceProviderPubkey],
        '#d': pubkeysNeedingLookup,
      },
    ]
  }, [rankTrustedServiceProviderPubkey, rankNip85Relay, pubkeysNeedingLookup])

  // Fetch kind 30382 Trusted Assertions
  const { events: trustedAssertionEvents } = useSubscribe({
    filters: trustedAssertionFilter || [],
    relays: rankNip85Relay ? [rankNip85Relay] : [],
    enabled: !!trustedAssertionFilter && !!rankNip85Relay,
  })

  // Track processed event IDs to avoid reprocessing
  const processedEventIds = useRef(new Set())

  // Process Trusted Assertion events - update SessionStorage only, then trigger re-render once
  useEffect(() => {
    if (!trustedAssertionEvents || trustedAssertionEvents.length === 0) return

    let hasNewScores = false

    trustedAssertionEvents.forEach((taEvent) => {
      if (processedEventIds.current.has(taEvent.id)) return
      processedEventIds.current.add(taEvent.id)

      const dTag = taEvent.tags.find((t) => t[0] === 'd')
      if (!dTag || !dTag[1]) return
      const subjectPubkey = dTag[1]

      const rankTag = taEvent.tags.find((t) => t[0] === 'rank')
      if (rankTag && rankTag[1] !== undefined) {
        const rankValue = parseInt(rankTag[1], 10)
        if (!isNaN(rankValue) && rankValue >= 0 && rankValue <= 100) {
          updateRankScoreLookup(subjectPubkey, rankValue)
          hasNewScores = true
        }
      }
    })

    // Trigger a single re-render after processing all events
    if (hasNewScores) {
      setUpdateTrigger((prev) => prev + 1)
    }
  }, [trustedAssertionEvents])

  // Get Trust Score for a pubkey (fallback to 0)
  const getTrustScore = (pubkey) => {
    const score = getTrustScoreFromStorage(pubkey)
    return typeof score === 'number' ? score : 0
  }

  // Check if author has submitted a kind 7 reaction
  const authorHasReaction = useMemo(() => {
    if (!listItemAuthorPubkey) return false
    return validReactions.some((r) => r.pubkey === listItemAuthorPubkey)
  }, [listItemAuthorPubkey, validReactions])

  // Calculate final score - include updateTrigger to recalculate after new scores are fetched
  const { finalScore, trustedUpvotes, trustedDownvotes } = useMemo(() => {
    let score = 0
    let upvotes = 0
    let downvotes = 0

    // Author contribution (upvote-by-authorship) - only if author hasn't submitted a kind 7 reaction
    if (listItemAuthorPubkey && !authorHasReaction) {
      const authorScore = getTrustScore(listItemAuthorPubkey)
      if (authorScore >= trustScoreCutoff) {
        score += 1
      }
    }

    // Reactions contribution
    validReactions.forEach((r) => {
      const reactorScore = getTrustScore(r.pubkey)
      if (reactorScore >= trustScoreCutoff) {
        if (r.content === '+') {
          score += 1
          upvotes += 1
        } else if (r.content === '-') {
          score -= 1
          downvotes += 1
        }
      }
    })

    return { finalScore: score, trustedUpvotes: upvotes, trustedDownvotes: downvotes }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listItemAuthorPubkey, validReactions, trustScoreCutoff, authorHasReaction, updateTrigger])

  // Helper to format time ago
  const getTimeAgoString = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return `${diff} second${diff !== 1 ? 's' : ''} ago`
  }

  // Truncate pubkey for display
  const truncatePubkey = (pk) => {
    if (!pk) return 'Unknown'
    if (pk.length <= 16) return pk
    return `${pk.slice(0, 8)}...${pk.slice(-8)}`
  }

  // Error state for unrecognized uuidType
  if (uuidType !== 'aTag' && uuidType !== 'eventId') {
    return (
      <div style={{ padding: '20px' }}>
        <CAlert color="danger">
          Unable to search for reactions to this list item due to unrecognized uuid type:{' '}
          {uuidType || 'undefined'}
        </CAlert>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <center>
        <h3>List Item Curation Details</h3>
      </center>

      {/* Final Score Panel */}
      <CCard style={{ marginBottom: '20px' }}>
        <CCardBody>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px' }}>
              Final Score:{' '}
              <strong style={{ color: finalScore >= 0 ? '#28a745' : '#dc3545' }}>
                {finalScore}
              </strong>
            </h2>
            <p style={{ marginBottom: '5px' }}>
              <strong>{trustedUpvotes}</strong> upvote{trustedUpvotes !== 1 ? 's' : ''},{' '}
              <strong>{trustedDownvotes}</strong> downvote{trustedDownvotes !== 1 ? 's' : ''} from
              trusted users
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Trust Score Cutoff: <strong>{trustScoreCutoff}</strong>
            </p>
          </div>
        </CCardBody>
      </CCard>

      {/* Reactions Table */}
      <CCard>
        <CCardBody>
          <h5>Reactions</h5>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Author</CTableHeaderCell>
                <CTableHeaderCell>Trust Score</CTableHeaderCell>
                <CTableHeaderCell>Time</CTableHeaderCell>
                <CTableHeaderCell>Reaction</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {/* Author row (special styling) */}
              {listItemAuthorPubkey && (
                <CTableRow style={{ backgroundColor: '#e7f3ff', fontWeight: 'bold' }}>
                  <CTableDataCell title={listItemAuthorPubkey}>
                    {truncatePubkey(listItemAuthorPubkey)}
                  </CTableDataCell>
                  <CTableDataCell>{getTrustScore(listItemAuthorPubkey)}</CTableDataCell>
                  <CTableDataCell>
                    {event?.created_at ? getTimeAgoString(event.created_at) : '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <em>author</em>
                  </CTableDataCell>
                </CTableRow>
              )}

              {/* Reaction rows */}
              {validReactions.map((reaction, index) => {
                const reactorScore = getTrustScore(reaction.pubkey)
                const isBelowCutoff = reactorScore < trustScoreCutoff
                return (
                  <CTableRow
                    key={reaction.id || index}
                    style={
                      isBelowCutoff
                        ? { opacity: 0.5, textDecoration: 'line-through', color: '#999' }
                        : {}
                    }
                  >
                    <CTableDataCell title={reaction.pubkey}>
                      {truncatePubkey(reaction.pubkey)}
                    </CTableDataCell>
                    <CTableDataCell>{reactorScore}</CTableDataCell>
                    <CTableDataCell>{getTimeAgoString(reaction.created_at)}</CTableDataCell>
                    <CTableDataCell>{reaction.content === '+' ? '👍' : '👎'}</CTableDataCell>
                  </CTableRow>
                )
              })}

              {/* Empty state */}
              {validReactions.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={4} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    No valid reactions found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ViewCuration
