import React, { useMemo } from 'react'
import { useSubscribe } from 'nostr-hooks'
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
  // ============ STEP 1: Static Configuration ============

  // Get relays from SessionStorage (computed once)
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

  // ============ STEP 2: Fetch Reactions ============

  // Build filter based on uuidType
  const reactionFilter = useMemo(() => {
    if (uuidType === 'aTag') {
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

  // ============ STEP 3: Process Reactions (deduplicate) ============

  // Filter valid reactions and deduplicate by author (keep most recent)
  const validReactions = useMemo(() => {
    if (!reactions) return []
    const valid = reactions.filter((r) => r.content === '+' || r.content === '-')
    valid.sort((a, b) => b.created_at - a.created_at)
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

  // ============ STEP 4: Trust Score Lookup (SessionStorage only - NO fetching) ============

  // Helper to get Trust Score from SessionStorage ONLY
  // Returns null if not found (will default to 0)
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

  // Get trust score - check SessionStorage, default to 0 if not found
  const getTrustScore = (pubkey) => {
    const stored = getTrustScoreFromStorage(pubkey)
    return typeof stored === 'number' ? stored : 0
  }

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

  // ============ STEP 8: Calculate Final Score ============

  const { finalScore, trustedUpvotes, trustedDownvotes } = useMemo(() => {
    let score = 0
    let upvotes = 0
    let downvotes = 0

    // Author implicit upvote (only if no explicit reaction)
    const authorHasReaction = validReactions.some((r) => r.pubkey === event?.pubkey)
    if (event?.pubkey && !authorHasReaction && getTrustScore(event.pubkey) >= trustScoreCutoff) {
      score += 1
    }

    // Count trusted reactions
    validReactions.forEach((r) => {
      if (getTrustScore(r.pubkey) >= trustScoreCutoff) {
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
  }, [validReactions, event?.pubkey, trustScoreCutoff])

  // ============ RENDER ============

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
              {event?.pubkey && (
                <CTableRow style={{ backgroundColor: '#e7f3ff', fontWeight: 'bold' }}>
                  <CTableDataCell title={event.pubkey}>
                    {truncatePubkey(event.pubkey)}
                  </CTableDataCell>
                  <CTableDataCell>{getTrustScore(event.pubkey)}</CTableDataCell>
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
