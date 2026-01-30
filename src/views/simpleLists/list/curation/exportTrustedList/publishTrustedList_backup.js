import React from 'react'
import { CCard, CCardBody, CCardTitle } from '@coreui/react'

const aTrustedListRelays = JSON.parse(sessionStorage.getItem('aTrustedListRelays') || '[]')
// const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

// parse tags
const parseNamePlural = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[2] : ''
}

const parseNameSingular = (tags) => {
  const aNames = tags.filter((tag) => tag[0] === 'names')[0]
  return aNames ? aNames[1] : ''
}

const parseDTag = (tags) => {
  const aDTag = tags.filter((tag) => tag[0] === 'd')[0]
  return aDTag ? aDTag[1] : ''
}

// Generate automatic d-tag
const generateAutoDTag_backup = (singular, plural, desc) => {
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

// Generate automatic d-tag
const generateAutoDTag = (event) => {
  if (event.kind === 9998 || event.kind === 9999) {
    return event.id
  }
  if (event.kind === 39998 || event.kind === 39999) {
    uuic = event.kind + ':' + event.pubkey + ':' + parseDTag(event.tags)
    return uuid
  }
}

const PublishTrustedList = ({ activeUser, filteredResults, event }) => {
  const namePlural = parseNamePlural(event.tags)
  const nameSingular = parseNameSingular(event.tags)
  // const dTag = generateAutoDTag(nameSingular, namePlural, 'curated list')
  const dTag = generateAutoDTag(event)
  return (
    <CCard style={{ marginBottom: '20px' }}>
      <CCardBody>
        <CCardTitle>Publish Trusted List</CCardTitle>
        <p className="text-muted">Pubkish the curated items of this list as a Trusted List.</p>
        <p className="text-muted">d-tag: {dTag}</p>
        <p className="text-muted">name: {namePlural}</p>
        <p className="text-muted">singular: {nameSingular}</p>
      </CCardBody>
    </CCard>
  )
}

export default PublishTrustedList

/*
Example Trusted List, for list with name (plural) of `countries`

{
  "id": "<id>",
  "pubkey": "<logged-in-user-pubkey>",
  "created_at": <timestamp>,
  "kind": 30391,
  "content": "",
  "tags": [
    ["d", "4dj020e4"],
    ["name", "curated list of countries"],
    ["metric", "trusted-reactions"],
    ["e", "<event id>", "<relay hint>", "<author pubkey>", "100"],
    ["e", "<event id>", "<relay hint>", "<author pubkey>", "89"],
    ["a", "<kind>:<pubkey>:<d-tag>", "<relay hint>", "<author pubkey>", "86"],
    ["a", "<kind>:<pubkey>:<d-tag>", "<relay hint>", "<author pubkey>", "84"]
  ]
}

To populate the e-tags, we need to iterate through the filteredResults and add an e-tag for each result.
The format is: ["e", "<event id>", "<optional relay hint>", "<optional author pubkey>", "<optional weight>"]

The relay hint will be the first relay in aDListRelays. If aDListRelays is empty, then the relay hint will be the empty string.
The author pubkey will be the pubkey of the author of the event.

The final element of each e-tag or a-tag is the stringified trust score of the item.
*/
