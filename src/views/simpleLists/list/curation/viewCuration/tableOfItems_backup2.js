import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSubscribe } from 'nostr-hooks'
import { SimplePool } from 'nostr-tools'
import {
  CButton,
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import AuthorAvatar from 'src/components/users/authorAvatar'
import defaults from 'src/views/settings/parameters/defaults.json'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseDescription = (tags) => {
  const aDescription = tags.filter((tag) => tag[0] === 'description')[0]
  return aDescription ? aDescription[1] : ''
}

const parseName = (tags) => {
  const aName = tags.filter((tag) => tag[0] === 'name')[0]
  return aName ? aName[1] : ''
}

const parseDTag = (tags) => {
  const aDTags = tags.filter((tag) => tag[0] === 'd')[0]
  return aDTags ? aDTags[1] : ''
}

const NextRow = ({ activeUser, event, author, name, uuid, stats }) => {
  const { trustedUpvotes, trustedDownvotes, finalScore } = stats || {
    trustedUpvotes: 0,
    trustedDownvotes: 0,
    finalScore: 0,
  }

  return (
    <CTableRow key={event.id}>
      <CTableDataCell style={{ width: '10%' }}>
        <AuthorAvatar author={author} />
      </CTableDataCell>
      <CTableDataCell style={{ width: '50%', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
        {name}
      </CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>{trustedUpvotes}</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>{trustedDownvotes}</CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>
        <strong style={{ color: finalScore >= 0 ? '#28a745' : '#dc3545' }}>{finalScore}</strong>
      </CTableDataCell>
      <CTableDataCell style={{ width: '10%' }}>
        <CButton
          color="primary"
          size="sm"
          href={`#/simpleLists/list/items/item/viewItem?uuid=${uuid}`}
        >
          View
        </CButton>
      </CTableDataCell>
    </CTableRow>
  )
}

const TableOfItems = ({ activeUser, zTag = '' }) => {
  const [showMyListsOnly, setShowMyListsOnly] = useState(false)
  const [kindFilter, setKindFilter] = useState('all') // 'all', 'editable', 'notEditable'

  // ============ 1. Configuration & Helpers ============

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

  // ============ 2. Fetch List Items ============

  // Create filter based on zTag parameter
  const filter = useMemo(() => (zTag ? [{ kinds: [9999, 39999], '#z': [zTag] }] : []), [zTag])
  const { events: listItems } = useSubscribe({ filters: filter, relays: aDListRelays })

  // ============ 3. Fetch Reactions ============

  // Build filter for all list items
  const reactionFilter = useMemo(() => {
    if (!listItems || listItems.length === 0) return null
    const eTags = []
    const aTags = []
    listItems.forEach((e) => {
      if (e.kind === 9999) {
        eTags.push(e.id)
      } else if (e.kind === 39999) {
        const d = e.tags.find((t) => t[0] === 'd')?.[1]
        if (d) {
          aTags.push(`${e.kind}:${e.pubkey}:${d}`)
        }
      }
    })

    const f = { kinds: [7] }
    let hasFilter = false
    if (eTags.length > 0) {
      f['#e'] = eTags
      hasFilter = true
    }
    if (aTags.length > 0) {
      f['#a'] = aTags
      hasFilter = true
    }

    return hasFilter ? [f] : null
  }, [listItems])

  const { events: reactions } = useSubscribe({
    filters: reactionFilter || [],
    relays: aDListRelays,
    enabled: !!reactionFilter && aDListRelays.length > 0,
  })

  // ============ 4. Trust Score Fetching (Imperative) ============

  // State for fetched trust scores (triggers re-render when updated)
  const [fetchedScores, setFetchedScores] = useState({})

  // Ref to track which pubkeys we've already attempted to fetch
  const fetchedPubkeysRef = useRef(new Set())

  // Ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false)

  // Imperative fetch of trust scores
  useEffect(() => {
    if (!rankNip85Relay || !rankTrustedServiceProviderPubkey) return
    if (isFetchingRef.current) return
    if (!listItems || listItems.length === 0) return

    // Collect pubkeys from list items and reactions
    const pubkeysToCheck = new Set()

    // Add list item authors
    listItems.forEach((item) => {
      if (item.pubkey && item.pubkey !== activeUser?.pubkey) {
        pubkeysToCheck.add(item.pubkey)
      }
    })

    // Add reaction authors
    if (reactions) {
      reactions.forEach((r) => {
        if (r.pubkey && r.pubkey !== activeUser?.pubkey) {
          pubkeysToCheck.add(r.pubkey)
        }
      })
    }

    // Filter to those needing fetch
    const pubkeysToFetch = []
    pubkeysToCheck.forEach((pk) => {
      if (!fetchedPubkeysRef.current.has(pk) && getTrustScoreFromStorage(pk) === null) {
        pubkeysToFetch.push(pk)
        fetchedPubkeysRef.current.add(pk)
      }
    })

    if (pubkeysToFetch.length === 0) return

    isFetchingRef.current = true

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
    listItems,
    reactions,
    activeUser?.pubkey,
    rankNip85Relay,
    rankTrustedServiceProviderPubkey,
    getTrustScoreFromStorage,
    updateRankScoreLookup,
  ])

  // Get trust score helper
  const getTrustScore = useCallback(
    (pubkey) => {
      if (activeUser?.pubkey && pubkey === activeUser.pubkey) return 100
      if (typeof fetchedScores[pubkey] === 'number') return fetchedScores[pubkey]
      const stored = getTrustScoreFromStorage(pubkey)
      return typeof stored === 'number' ? stored : 0
    },
    [activeUser?.pubkey, fetchedScores, getTrustScoreFromStorage],
  )

  // ============ 5. Calculate Scores & Sort ============

  const scoredEvents = useMemo(() => {
    if (!listItems) return []

    // 1. Group valid reactions by target item UUID
    // Map: targetUuid -> [reactionEvents]
    const reactionsByTarget = {}

    if (reactions) {
      // Sort reactions by created_at desc first to help with "most recent" deduplication logic
      const sortedReactions = [...reactions].sort((a, b) => b.created_at - a.created_at)

      sortedReactions.forEach((r) => {
        if (r.content !== '+' && r.content !== '-') return

        // Check for e-tag
        const eTag = r.tags.find((t) => t[0] === 'e')
        if (eTag) {
          const targetId = eTag[1]
          if (!reactionsByTarget[targetId]) reactionsByTarget[targetId] = []
          reactionsByTarget[targetId].push(r)
        }

        // Check for a-tag
        const aTag = r.tags.find((t) => t[0] === 'a')
        if (aTag) {
          const targetCoords = aTag[1]
          if (!reactionsByTarget[targetCoords]) reactionsByTarget[targetCoords] = []
          reactionsByTarget[targetCoords].push(r)
        }
      })
    }

    // 2. Process each list item
    const results = listItems.map((event) => {
      // Determine UUID for looking up reactions
      let reactionTargetKey = event.id
      if (event.kind === 39999) {
        const d = event.tags.find((t) => t[0] === 'd')?.[1]
        if (d) reactionTargetKey = `${event.kind}:${event.pubkey}:${d}`
      }

      // Get reactions for this item
      const itemReactions = reactionsByTarget[reactionTargetKey] || []

      // Deduplicate by author (keep most recent) - list is already sorted by date desc
      const uniqueReactions = []
      const seenAuthors = new Set()
      itemReactions.forEach((r) => {
        if (!seenAuthors.has(r.pubkey)) {
          seenAuthors.add(r.pubkey)
          uniqueReactions.push(r)
        }
      })

      // Calculate score
      let score = 0
      let upvotes = 0
      let downvotes = 0

      // Author implicit upvote
      const authorHasReaction = uniqueReactions.some((r) => r.pubkey === event.pubkey)
      if (!authorHasReaction && getTrustScore(event.pubkey) >= trustScoreCutoff) {
        score += 1
      }

      // Trusted reactions
      uniqueReactions.forEach((r) => {
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
        event,
        stats: {
          finalScore: score,
          trustedUpvotes: upvotes,
          trustedDownvotes: downvotes,
        },
      }
    })

    // 3. Sort by finalScore descending
    return results.sort((a, b) => b.stats.finalScore - a.stats.finalScore)
  }, [listItems, reactions, trustScoreCutoff, getTrustScore])

  // ============ 6. Render ============

  if (!listItems || listItems.length === 0) {
    return (
      <CContainer>
        <center>
          <h3>No Event Data Available</h3>
        </center>
        <p style={{ textAlign: 'center' }}>Could not fetch event data for the provided zTag.</p>
      </CContainer>
    )
  }

  // Filter events based on view options
  // Note: we apply filtering AFTER scoring/sorting usually, or before.
  // The original code filtered `events`. Here we filter `scoredEvents`.

  const userFilteredResults =
    showMyListsOnly && activeUser
      ? scoredEvents.filter((item) => item.event.pubkey === activeUser.pubkey)
      : scoredEvents

  const finalFilteredResults =
    kindFilter === 'editable'
      ? userFilteredResults.filter((item) => item.event.kind === 39998)
      : kindFilter === 'notEditable'
        ? userFilteredResults.filter((item) => item.event.kind === 9998)
        : userFilteredResults

  const toggleKindFilter = () => {
    setKindFilter((prev) => {
      if (prev === 'all') return 'editable'
      if (prev === 'editable') return 'notEditable'
      return 'all'
    })
  }

  return (
    <CContainer style={{ padding: '20px' }}>
      <CButton
        color="primary"
        size="sm"
        style={{ marginBottom: '10px' }}
        href={`#/simpleLists/list/viewHeader`}
      >
        List Header: Overview
      </CButton>
      <p>Events: {listItems.length}</p>
      <CTable striped hover style={{ width: '100%', tableLayout: 'fixed' }}>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell style={{ width: '10%' }}>Author</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '50%' }}>Item Name</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>trusted 👍</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>trusted 👎</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>Total</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '10%' }}>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {finalFilteredResults.map(({ event, stats }) => {
            const name = parseName(event.tags)
            const author = event.pubkey
            const kind = event.kind
            let uuid = ''
            if (parseInt(kind) === 39999) {
              const dTag = parseDTag(event.tags)
              uuid = kind + ':' + author + ':' + dTag
            }
            if (parseInt(kind) === 9999) {
              uuid = event.id
            }
            return (
              <NextRow
                key={event.id}
                activeUser={activeUser}
                event={event}
                author={author}
                name={name}
                uuid={uuid}
                stats={stats}
              />
            )
          })}
        </CTableBody>
      </CTable>
    </CContainer>
  )
}

export default TableOfItems
