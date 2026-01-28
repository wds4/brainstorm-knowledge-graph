import React, { useMemo, useRef, useEffect, useState } from 'react'
import { useActiveUser, useSubscribe } from 'nostr-hooks'
import { CRow, CCol } from '@coreui/react'
import defaults from 'src/views/settings/parameters/defaults.json'

const SingleItemCurationsScorePanel = ({ event, uuid = '', uuidType = '' }) => {
  const { activeUser } = useActiveUser()
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

  // Filter valid reactions, deduplicate by author (keep most recent), and sort
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
  const { finalScore, trustedUpvotes, trustedDownvotes, authorshipContributes } = useMemo(() => {
    let score = 0
    let upvotes = 0
    let downvotes = 0

    // Check if author is trusted and upvote-by-authorship contributes
    const authorIsTrusted = listItemAuthorPubkey
      ? getTrustScore(listItemAuthorPubkey) >= trustScoreCutoff
      : false
    const authorship = listItemAuthorPubkey && !authorHasReaction && authorIsTrusted

    // Author contribution (upvote-by-authorship) - only if author hasn't submitted a kind 7 reaction
    if (authorship) {
      score += 1
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

    return {
      finalScore: score,
      trustedUpvotes: upvotes,
      trustedDownvotes: downvotes,
      authorshipContributes: authorship,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listItemAuthorPubkey, validReactions, trustScoreCutoff, authorHasReaction, updateTrigger])

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
