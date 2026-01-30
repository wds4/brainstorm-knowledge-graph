import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSubscribe } from 'nostr-hooks'
import { SimplePool } from 'nostr-tools'
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import NextRow from './nextRow'
import defaults from 'src/views/settings/parameters/defaults.json'
import PublishTrustedList from './publishTrustedList'

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

const TableOfItems = ({ activeUser, zTag = '', event }) => {
  const [showMyListsOnly, setShowMyListsOnly] = useState(false)
  const [kindFilter, setKindFilter] = useState('all') // 'all', 'editable', 'notEditable'

  // ============ STEP 1: Configuration ============

  const trustScoreCutoff = useMemo(() => {
    const stored = sessionStorage.getItem('trustScoreCutoff')
    if (stored !== null) {
      const parsed = parseInt(stored, 10)
      return isNaN(parsed) ? defaults.trustScoreCutoff : parsed
    }
    return defaults.trustScoreCutoff
  }, [])

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

  // ============ STEP 2: Fetch List Items ============

  const filter = useMemo(() => (zTag ? [{ kinds: [9999, 39999], '#z': [zTag] }] : []), [zTag])
  const { events: listItems } = useSubscribe({ filters: filter, relays: aDListRelays })

  // ============ STEP 3: Fetch Reactions for All Items ============

  const reactionFilter = useMemo(() => {
    if (!listItems || listItems.length === 0) return null
    const eTags = []
    const aTags = []
    listItems.forEach((item) => {
      if (item.kind === 9999) {
        eTags.push(item.id)
      } else if (item.kind === 39999) {
        // For kind 39999, reactions can use EITHER a-tag OR e-tag
        const d = item.tags.find((t) => t[0] === 'd')?.[1]
        if (d) {
          aTags.push(`${item.kind}:${item.pubkey}:${d}`)
        }
        // Also add event ID for e-tag reactions
        if (item.id) {
          eTags.push(item.id)
        }
      }
    })

    // Create separate filter objects for OR logic
    const filters = []
    if (eTags.length > 0) {
      filters.push({ kinds: [7], '#e': eTags })
    }
    if (aTags.length > 0) {
      filters.push({ kinds: [7], '#a': aTags })
    }

    const result = filters.length > 0 ? filters : null
    console.log('[TableOfItems] Reaction filter:', JSON.stringify(result, null, 2))
    return result
  }, [listItems])

  const { events: reactions } = useSubscribe({
    filters: reactionFilter || [],
    relays: aDListRelays,
    enabled: !!reactionFilter && aDListRelays.length > 0,
  })

  // Debug log reactions
  useEffect(() => {
    if (reactions && reactions.length > 0) {
      console.log(`[TableOfItems] Received ${reactions.length} reactions:`)
      reactions.forEach((r) => {
        const eTag = r.tags.find((t) => t[0] === 'e')?.[1]
        const aTag = r.tags.find((t) => t[0] === 'a')?.[1]
        console.log(
          `  - Reaction ID: ${r.id}, content: "${r.content}", e-tag: ${eTag || 'none'}, a-tag: ${aTag || 'none'}, author: ${r.pubkey.substring(0, 8)}...`,
        )
      })
    }
  }, [reactions])

  // ============ STEP 4: Trust Score Fetching (Imperative) ============

  const [fetchedScores, setFetchedScores] = useState({})
  const fetchedPubkeysRef = useRef(new Set())
  const isFetchingRef = useRef(false)

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

  useEffect(() => {
    if (!rankNip85Relay || !rankTrustedServiceProviderPubkey) return
    if (isFetchingRef.current) return
    if (!listItems || listItems.length === 0) return

    const pubkeysToCheck = new Set()

    listItems.forEach((item) => {
      if (item.pubkey && item.pubkey !== activeUser?.pubkey) {
        pubkeysToCheck.add(item.pubkey)
      }
    })

    if (reactions) {
      reactions.forEach((r) => {
        if (r.pubkey && r.pubkey !== activeUser?.pubkey) {
          pubkeysToCheck.add(r.pubkey)
        }
      })
    }

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

  const getTrustScore = useCallback(
    (pubkey) => {
      if (activeUser?.pubkey && pubkey === activeUser.pubkey) return 100
      if (typeof fetchedScores[pubkey] === 'number') return fetchedScores[pubkey]
      const stored = getTrustScoreFromStorage(pubkey)
      return typeof stored === 'number' ? stored : 0
    },
    [activeUser?.pubkey, fetchedScores, getTrustScoreFromStorage],
  )

  // ============ STEP 5: Calculate Scores & Sort ============

  const scoredAndSortedItems = useMemo(() => {
    if (!listItems) return []

    const reactionsByTarget = {}

    if (reactions) {
      const sortedReactions = [...reactions].sort((a, b) => b.created_at - a.created_at)
      console.log('[TableOfItems] Grouping reactions by target...')

      sortedReactions.forEach((r) => {
        if (r.content !== '+' && r.content !== '-') return

        const eTag = r.tags.find((t) => t[0] === 'e')
        if (eTag) {
          const targetId = eTag[1]
          if (!reactionsByTarget[targetId]) reactionsByTarget[targetId] = []
          reactionsByTarget[targetId].push(r)
          console.log(
            `  - Reaction ${r.id.substring(0, 8)} mapped to e-tag: ${targetId.substring(0, 8)}`,
          )
        }

        const aTag = r.tags.find((t) => t[0] === 'a')
        if (aTag) {
          const targetCoords = aTag[1]
          if (!reactionsByTarget[targetCoords]) reactionsByTarget[targetCoords] = []
          reactionsByTarget[targetCoords].push(r)
          console.log(`  - Reaction ${r.id.substring(0, 8)} mapped to a-tag: ${targetCoords}`)
        }
      })
      console.log('[TableOfItems] reactionsByTarget keys:', Object.keys(reactionsByTarget))
    }

    const results = listItems.map((event) => {
      // For kind 39999, reactions can be under EITHER event ID OR a-tag coordinates
      let itemReactions = []

      if (event.kind === 39999) {
        const d = event.tags.find((t) => t[0] === 'd')?.[1]
        const aTagKey = d ? `${event.kind}:${event.pubkey}:${d}` : null
        const eTagKey = event.id

        console.log(
          `[TableOfItems] Processing item ${event.id.substring(0, 8)}, kind: ${event.kind}`,
        )
        console.log(`  - Looking up by e-tag: ${eTagKey.substring(0, 8)}`)
        console.log(`  - Looking up by a-tag: ${aTagKey}`)

        // Collect reactions from both keys
        const reactionsFromE = reactionsByTarget[eTagKey] || []
        const reactionsFromA = aTagKey ? reactionsByTarget[aTagKey] || [] : []

        // Merge and deduplicate by reaction ID
        const seenIds = new Set()
        itemReactions = [...reactionsFromE, ...reactionsFromA].filter((r) => {
          if (seenIds.has(r.id)) return false
          seenIds.add(r.id)
          return true
        })

        console.log(
          `  - Found ${reactionsFromE.length} from e-tag, ${reactionsFromA.length} from a-tag, ${itemReactions.length} total after dedup`,
        )
      } else {
        // For kind 9999, only use event ID
        const eTagKey = event.id
        console.log(
          `[TableOfItems] Processing item ${event.id.substring(0, 8)}, kind: ${event.kind}, targetKey: ${eTagKey}`,
        )
        itemReactions = reactionsByTarget[eTagKey] || []
        console.log(`  - Found ${itemReactions.length} reactions for this item`)
      }

      const uniqueReactions = []
      const seenAuthors = new Set()
      itemReactions.forEach((r) => {
        if (!seenAuthors.has(r.pubkey)) {
          seenAuthors.add(r.pubkey)
          uniqueReactions.push(r)
        }
      })

      let score = 0
      let upvotes = 0
      let downvotes = 0

      const authorHasReaction = uniqueReactions.some((r) => r.pubkey === event.pubkey)
      const authorTrustScore = getTrustScore(event.pubkey)
      console.log(`  - Author trust score: ${authorTrustScore}, has reaction: ${authorHasReaction}`)
      if (!authorHasReaction && authorTrustScore >= trustScoreCutoff) {
        score += 1
        console.log(`  - Added implicit author upvote`)
      }

      uniqueReactions.forEach((r) => {
        const raterTrustScore = getTrustScore(r.pubkey)
        console.log(
          `  - Reaction author ${r.pubkey.substring(0, 8)}, trust score: ${raterTrustScore}, content: "${r.content}"`,
        )
        if (raterTrustScore >= trustScoreCutoff) {
          if (r.content === '+') {
            score += 1
            upvotes += 1
            console.log(`    -> Counted as upvote`)
          } else if (r.content === '-') {
            score -= 1
            downvotes += 1
            console.log(`    -> Counted as downvote`)
          }
        } else {
          console.log(`    -> Below cutoff (${trustScoreCutoff}), not counted`)
        }
      })

      console.log(`  - Final stats: upvotes=${upvotes}, downvotes=${downvotes}, score=${score}`)

      return {
        event,
        stats: {
          finalScore: score,
          trustedUpvotes: upvotes,
          trustedDownvotes: downvotes,
        },
      }
    })

    return results.sort((a, b) => b.stats.finalScore - a.stats.finalScore)
  }, [listItems, reactions, trustScoreCutoff, getTrustScore])

  // ============ STEP 6: Apply UI Filters ============

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

  const userFilteredResults =
    showMyListsOnly && activeUser
      ? scoredAndSortedItems.filter((item) => item.event.pubkey === activeUser.pubkey)
      : scoredAndSortedItems

  const filteredResults =
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
          {filteredResults.map(({ event, stats }) => {
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
      <PublishTrustedList activeUser={activeUser} filteredResults={filteredResults} event={event} />
    </CContainer>
  )
}

export default TableOfItems
