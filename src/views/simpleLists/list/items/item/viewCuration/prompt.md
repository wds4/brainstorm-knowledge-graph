View Curation Page Implementation
=================================
(This strategy has not yet been implemented)
-----

## Overview

This document describes how to implement `viewCuration.js` - a component that displays curation details for a single list item, including reactions (upvotes/downvotes) and trust scores.

## Props

The component receives these props from its parent:
- `activeUser` - The logged-in user object (with `.pubkey` property)
- `event` - The list item event object (with `.id`, `.pubkey`, `.created_at`)
- `uuid` - The identifier for the list item (aTag string or event ID)
- `uuidType` - Either `"aTag"` or `"eventId"`

## Data Requirements

1. **Kind 7 Reactions**: Fetch NIP-25 reactions referencing this list item
2. **Trust Scores**: For each reaction author (and the list item author), we need their trust score

## Architecture: Avoiding Infinite Loops

### The Problem We Must Avoid

Previous implementations caused infinite re-render loops due to this pattern:
1. Fetch reactions → extract pubkeys needing trust scores
2. Fetch trust scores for those pubkeys
3. Store results → triggers recalculation of "pubkeys needing lookup"
4. Filter changes → new subscription → more events → loop

### The Solution: "Request Once" Pattern

**Key Principle**: Track what pubkeys we have REQUESTED, not what we have RECEIVED.

Use a `useRef` to maintain a Set of pubkeys we've already added to our lookup request. Once a pubkey is added to this Set, it is never removed, and the subscription filter only grows (never shrinks).

This breaks the loop because:
- Adding new trust scores to storage does NOT change the filter
- The filter only changes when NEW pubkeys appear (from new reactions)
- We never re-request pubkeys we've already requested

## Implementation Steps

### Step 1: Static Configuration (no dependencies)

```javascript
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

// Get NIP-85 rank provider settings
const rankNip85Relay = useMemo(() => { ... }, [])
const rankTrustedServiceProviderPubkey = useMemo(() => { ... }, [])
```

### Step 2: Fetch Reactions

```javascript
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

// Fetch reactions
const { events: reactions } = useSubscribe({
  filters: reactionFilter || [],
  relays: aDListRelays,
  enabled: !!reactionFilter && aDListRelays.length > 0,
})
```

### Step 3: Process Reactions (deduplicate)

```javascript
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
```

### Step 4: Trust Score Lookup - THE CRITICAL PART

```javascript
// Track pubkeys we've already requested (NEVER remove from this)
const requestedPubkeysRef = useRef(new Set())

// Track fetched trust scores in state for re-rendering
const [trustScores, setTrustScores] = useState({})

// Collect ALL pubkeys and add to requested set
// This effect ONLY ADDS to requestedPubkeysRef, never removes
const pubkeysForFilter = useMemo(() => {
  const newPubkeys = []
  
  // Add list item author
  if (event?.pubkey && !requestedPubkeysRef.current.has(event.pubkey)) {
    // Skip active user (always score 100)
    if (event.pubkey !== activeUser?.pubkey) {
      requestedPubkeysRef.current.add(event.pubkey)
      newPubkeys.push(event.pubkey)
    }
  }
  
  // Add reaction authors
  validReactions.forEach((r) => {
    if (r.pubkey && !requestedPubkeysRef.current.has(r.pubkey)) {
      if (r.pubkey !== activeUser?.pubkey) {
        requestedPubkeysRef.current.add(r.pubkey)
        newPubkeys.push(r.pubkey)
      }
    }
  })
  
  // Filter out pubkeys we already have scores for in SessionStorage
  const needLookup = newPubkeys.filter((pk) => {
    const stored = getTrustScoreFromStorage(pk)
    return stored === null
  })
  
  // Return the FULL list of all pubkeys we've ever requested that need lookup
  // This is stable - only grows, never shrinks
  return Array.from(requestedPubkeysRef.current).filter((pk) => {
    return getTrustScoreFromStorage(pk) === null && trustScores[pk] === undefined
  })
}, [event?.pubkey, validReactions, activeUser?.pubkey])
// NOTE: trustScores is intentionally in deps - but we only ADD to it, never remove
```

**IMPORTANT**: The filter for kind 30382 events should use `requestedPubkeysRef.current` directly, not a recalculated list.

### Step 5: Fetch Trusted Assertions

```javascript
// Build filter for kind 30382 - use a stable ref-based approach
const [pubkeysToFetch, setPubkeysToFetch] = useState([])

// Only update pubkeysToFetch when we have NEW pubkeys to add
useEffect(() => {
  const newPubkeys = []
  
  if (event?.pubkey && event.pubkey !== activeUser?.pubkey) {
    if (!requestedPubkeysRef.current.has(event.pubkey)) {
      requestedPubkeysRef.current.add(event.pubkey)
      if (getTrustScoreFromStorage(event.pubkey) === null) {
        newPubkeys.push(event.pubkey)
      }
    }
  }
  
  validReactions.forEach((r) => {
    if (r.pubkey && r.pubkey !== activeUser?.pubkey) {
      if (!requestedPubkeysRef.current.has(r.pubkey)) {
        requestedPubkeysRef.current.add(r.pubkey)
        if (getTrustScoreFromStorage(r.pubkey) === null) {
          newPubkeys.push(r.pubkey)
        }
      }
    }
  })
  
  if (newPubkeys.length > 0) {
    setPubkeysToFetch((prev) => [...prev, ...newPubkeys])
  }
}, [event?.pubkey, validReactions, activeUser?.pubkey])

// Build filter - this only changes when pubkeysToFetch grows
const trustedAssertionFilter = useMemo(() => {
  if (!rankTrustedServiceProviderPubkey || !rankNip85Relay || pubkeysToFetch.length === 0) {
    return null
  }
  return [{
    kinds: [30382],
    authors: [rankTrustedServiceProviderPubkey],
    '#d': pubkeysToFetch,
  }]
}, [rankTrustedServiceProviderPubkey, rankNip85Relay, pubkeysToFetch])
```

### Step 6: Process Trusted Assertion Results

```javascript
const processedEventIds = useRef(new Set())

useEffect(() => {
  if (!trustedAssertionEvents || trustedAssertionEvents.length === 0) return

  const newScores = {}
  
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
        newScores[subjectPubkey] = rankValue
        updateRankScoreLookup(subjectPubkey, rankValue) // Save to SessionStorage
      }
    }
  })

  if (Object.keys(newScores).length > 0) {
    setTrustScores((prev) => ({ ...prev, ...newScores }))
  }
}, [trustedAssertionEvents])
```

### Step 7: Helper Functions

```javascript
// Get trust score - check state first, then SessionStorage, then default to 0
const getTrustScore = (pubkey) => {
  if (activeUser?.pubkey && pubkey === activeUser.pubkey) return 100
  if (typeof trustScores[pubkey] === 'number') return trustScores[pubkey]
  const stored = getTrustScoreFromStorage(pubkey)
  return typeof stored === 'number' ? stored : 0
}
```

### Step 8: Calculate Final Score

```javascript
const { finalScore, trustedUpvotes, trustedDownvotes } = useMemo(() => {
  let score = 0, upvotes = 0, downvotes = 0

  // Author implicit upvote (only if no explicit reaction)
  const authorHasReaction = validReactions.some((r) => r.pubkey === event?.pubkey)
  if (event?.pubkey && !authorHasReaction && getTrustScore(event.pubkey) >= trustScoreCutoff) {
    score += 1
  }

  // Count trusted reactions
  validReactions.forEach((r) => {
    if (getTrustScore(r.pubkey) >= trustScoreCutoff) {
      if (r.content === '+') { score += 1; upvotes += 1 }
      else if (r.content === '-') { score -= 1; downvotes += 1 }
    }
  })

  return { finalScore: score, trustedUpvotes: upvotes, trustedDownvotes: downvotes }
}, [validReactions, event?.pubkey, trustScores, trustScoreCutoff])
```

## UI Requirements

1. **Final Score Panel**: Display prominently with color coding (green ≥0, red <0)
2. **Summary**: Show count of trusted upvotes and downvotes
3. **Reactions Table**:
   - Special row for list item author (highlighted background)
   - Each reaction row shows: Author (truncated pubkey), Trust Score, Time, Reaction (👍/👎)
   - Rows for users below trustScoreCutoff should be visually muted (opacity, strikethrough)

## Key Takeaways

1. **Never recalculate "what to fetch" based on fetch results** - use refs to track requested pubkeys
2. **Only add to the filter, never remove** - filter grows monotonically
3. **Separate "requested" from "received"** - track them independently
4. **Use SessionStorage as cache** - check before adding to fetch list
5. **Process events idempotently** - track processed event IDs to avoid re-processing
