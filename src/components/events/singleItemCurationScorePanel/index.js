import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSubscribe } from 'nostr-hooks'
import { SimplePool } from 'nostr-tools'
import { CRow, CCol } from '@coreui/react'
import defaults from 'src/views/settings/parameters/defaults.json'

const SingleItemCurationsScorePanel = ({ activeUser, event, uuid = '', uuidType = '' }) => {
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

  // Get NIP-85 settings
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

  // ============ STEP 4: Trust Score Lookup ============

  // State for fetched trust scores (triggers re-render when updated)
  const [fetchedScores, setFetchedScores] = useState({})

  // Ref to track which pubkeys we've already attempted to fetch (prevents re-fetching)
  const fetchedPubkeysRef = useRef(new Set())

  // Ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false)

  // Helper to get Trust Score from SessionStorage
  const getTrustScoreFromStorage = useCallback(
    (pubkey) => {
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
    },
    [activeUser?.pubkey],
  )

  // Helper to update rank_score_lookup in SessionStorage
  const updateRankScoreLookup = useCallback(
    (pubkey, score) => {
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
    },
    [activeUser?.pubkey],
  )

  // Imperative fetch of trust scores - runs ONCE when we have pubkeys to fetch
  useEffect(() => {
    // Guard: must have relay and provider configured
    if (!rankNip85Relay || !rankTrustedServiceProviderPubkey) return

    // Guard: prevent concurrent fetches
    if (isFetchingRef.current) return

    // Collect pubkeys that need fetching (not in storage, not already fetched)
    const pubkeysToCheck = new Set()
    if (event?.pubkey && event.pubkey !== activeUser?.pubkey) {
      pubkeysToCheck.add(event.pubkey)
    }
    validReactions.forEach((r) => {
      if (r.pubkey && r.pubkey !== activeUser?.pubkey) {
        pubkeysToCheck.add(r.pubkey)
      }
    })

    // Filter to only those we haven't fetched yet and aren't in storage
    const pubkeysToFetch = []
    pubkeysToCheck.forEach((pk) => {
      if (!fetchedPubkeysRef.current.has(pk) && getTrustScoreFromStorage(pk) === null) {
        pubkeysToFetch.push(pk)
        fetchedPubkeysRef.current.add(pk) // Mark as "will fetch" immediately
      }
    })

    if (pubkeysToFetch.length === 0) return

    // Set fetching flag
    isFetchingRef.current = true

    // Imperative fetch using SimplePool
    const pool = new SimplePool()
    const filter = {
      kinds: [30382],
      authors: [rankTrustedServiceProviderPubkey],
      '#d': pubkeysToFetch,
    }

    const fetchTrustScores = async () => {
      try {
        const events = await pool.querySync([rankNip85Relay], filter)
        const newScores = {}

        events.forEach((taEvent) => {
          const dTag = taEvent.tags.find((t) => t[0] === 'd')
          if (!dTag || !dTag[1]) return
          const subjectPubkey = dTag[1]

          const rankTag = taEvent.tags.find((t) => t[0] === 'rank')
          if (rankTag && rankTag[1] !== undefined) {
            const rankValue = parseInt(rankTag[1], 10)
            if (!isNaN(rankValue) && rankValue >= 0 && rankValue <= 100) {
              newScores[subjectPubkey] = rankValue
              updateRankScoreLookup(subjectPubkey, rankValue)
            }
          }
        })

        // Update state to trigger re-render
        if (Object.keys(newScores).length > 0) {
          setFetchedScores((prev) => ({ ...prev, ...newScores }))
        }
      } catch (err) {
        console.error('Error fetching trust scores:', err)
      } finally {
        isFetchingRef.current = false
        pool.close([rankNip85Relay])
      }
    }

    fetchTrustScores()
  }, [
    validReactions,
    event?.pubkey,
    activeUser?.pubkey,
    rankNip85Relay,
    rankTrustedServiceProviderPubkey,
    getTrustScoreFromStorage,
    updateRankScoreLookup,
  ])

  // Get trust score - check fetched state first, then SessionStorage, default to 0
  const getTrustScore = useCallback(
    (pubkey) => {
      if (activeUser?.pubkey && pubkey === activeUser.pubkey) return 100
      if (typeof fetchedScores[pubkey] === 'number') return fetchedScores[pubkey]
      const stored = getTrustScoreFromStorage(pubkey)
      return typeof stored === 'number' ? stored : 0
    },
    [activeUser?.pubkey, fetchedScores, getTrustScoreFromStorage],
  )

  // ============ STEP 5: Calculate Final Score ============

  const { finalScore, trustedUpvotes, trustedDownvotes, authorshipContributes } = useMemo(() => {
    let score = 0
    let upvotes = 0
    let downvotes = 0

    // Author implicit upvote (only if no explicit reaction)
    const authorHasReaction = validReactions.some((r) => r.pubkey === event?.pubkey)
    const authorIsTrusted = event?.pubkey && getTrustScore(event.pubkey) >= trustScoreCutoff
    const authorship = event?.pubkey && !authorHasReaction && authorIsTrusted

    if (authorship) {
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

    return {
      finalScore: score,
      trustedUpvotes: upvotes,
      trustedDownvotes: downvotes,
      authorshipContributes: authorship,
    }
  }, [validReactions, event?.pubkey, trustScoreCutoff, getTrustScore])

  // ============ RENDER ============

  // Error state for unrecognized uuidType
  if (uuidType !== 'aTag' && uuidType !== 'eventId') {
    return <div style={{ color: '#dc3545' }}>Unrecognized uuid type</div>
  }

  return (
    <CRow
      className="align-items-center justify-content-center text-center"
      style={{ padding: '10px 0' }}
    >
      <CCol xs="auto">
        <span style={{ fontSize: '14px', color: '#666' }}>
          👍 <strong>{trustedUpvotes}</strong>
        </span>
      </CCol>
      <CCol xs="auto">
        <span style={{ fontSize: '14px', color: '#666' }}>
          👎 <strong>{trustedDownvotes}</strong>
        </span>
      </CCol>
      {authorshipContributes && (
        <CCol xs="auto">
          <span style={{ fontSize: '14px', color: '#28a745' }}>+1 trusted author</span>
        </CCol>
      )}
      <CCol xs="auto">
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Score:{' '}
          <span style={{ color: finalScore >= 0 ? '#28a745' : '#dc3545' }}>{finalScore}</span>
        </span>
      </CCol>
    </CRow>
  )
}

export default SingleItemCurationsScorePanel
