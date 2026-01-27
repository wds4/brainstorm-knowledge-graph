import React, { useState, useEffect } from 'react'
import defaults from './parameters/defaults.json'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
} from '@coreui/react'

// Removed hardcoded defaults, now imported from defaults.json

const initializeAllParameters = () => {
  console.log('initializeAllParameters')
  Object.keys(defaults.conceptUUIDs).forEach((key) => {
    sessionStorage.setItem(key, defaults.conceptUUIDs[key])
  })
  Object.keys(defaults.relationshipTypeUUIDs).forEach((key) => {
    sessionStorage.setItem(key, defaults.relationshipTypeUUIDs[key])
  })
  Object.keys(defaults.aRelays).forEach((key) => {
    sessionStorage.setItem(key, JSON.stringify(defaults.aRelays[key]))
  })
  sessionStorage.setItem('neo4jCypherQueryUrl', defaults.neo4jCypherQueryUrl)
  sessionStorage.setItem('trustScoreCutoff', defaults.trustScoreCutoff)
  sessionStorage.setItem('haveBKGParamsBeenInitialized', 'true')
}

const Settings = () => {
  const [activeValues, setActiveValues] = useState({})
  const [editing, setEditing] = useState({})
  const [relayInfo, setRelayInfo] = useState('Click on a relay array name for information')
  const [showDefaultMisc, setShowDefaultMisc] = useState(false)
  const [showDefaultConcept, setShowDefaultConcept] = useState(false)
  const [showDefaultRelationship, setShowDefaultRelationship] = useState(false)
  const [showDefaultRelay, setShowDefaultRelay] = useState(false)

  useEffect(() => {
    const initialized = sessionStorage.getItem('haveBKGParamsBeenInitialized') === 'true'
    if (!initialized) {
      initializeAllParameters()
    }
    refreshActiveValues()
  }, [])

  const refreshActiveValues = () => {
    const values = {}
    Object.keys(defaults.conceptUUIDs).forEach((key) => {
      const storedValue = sessionStorage.getItem(key)
      values[key] = storedValue !== null ? storedValue : defaults.conceptUUIDs[key]
    })
    Object.keys(defaults.relationshipTypeUUIDs).forEach((key) => {
      const storedValue = sessionStorage.getItem(key)
      values[key] = storedValue !== null ? storedValue : defaults.relationshipTypeUUIDs[key]
    })
    Object.keys(defaults.aRelays).forEach((key) => {
      const storedValue = sessionStorage.getItem(key)
      values[key] = storedValue !== null ? JSON.parse(storedValue) : defaults.aRelays[key]
    })
    values['neo4jCypherQueryUrl'] =
      sessionStorage.getItem('neo4jCypherQueryUrl') || defaults.neo4jCypherQueryUrl
    values['trustScoreCutoff'] =
      sessionStorage.getItem('trustScoreCutoff') || defaults.trustScoreCutoff
    setActiveValues(values)
  }

  const toggleEdit = (key) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = (key, value) => {
    sessionStorage.setItem(key, Array.isArray(value) ? JSON.stringify(value) : value)
    setActiveValues((prev) => ({ ...prev, [key]: value }))
    toggleEdit(key)
  }

  const handleRestore = (key) => {
    if (Object.keys(defaults.conceptUUIDs).includes(key)) {
      sessionStorage.setItem(key, defaults.conceptUUIDs[key])
      setActiveValues((prev) => ({ ...prev, [key]: defaults.conceptUUIDs[key] }))
    } else if (Object.keys(defaults.relationshipTypeUUIDs).includes(key)) {
      sessionStorage.setItem(key, defaults.relationshipTypeUUIDs[key])
      setActiveValues((prev) => ({ ...prev, [key]: defaults.relationshipTypeUUIDs[key] }))
    } else if (Object.keys(defaults.aRelays).includes(key)) {
      sessionStorage.setItem(key, JSON.stringify(defaults.aRelays[key]))
      setActiveValues((prev) => ({ ...prev, [key]: defaults.aRelays[key] }))
    } else if (key === 'neo4jCypherQueryUrl') {
      sessionStorage.setItem(key, defaults.neo4jCypherQueryUrl)
      setActiveValues((prev) => ({ ...prev, [key]: defaults.neo4jCypherQueryUrl }))
    } else if (key === 'trustScoreCutoff') {
      sessionStorage.setItem(key, defaults.trustScoreCutoff)
      setActiveValues((prev) => ({ ...prev, [key]: defaults.trustScoreCutoff }))
    }
  }

  const handleRelayClick = (relayName, info) => {
    setRelayInfo(info)
  }

  const handleResetAll = () => {
    initializeAllParameters()
    refreshActiveValues()
  }

  return (
    <>
      <center>
        <h3>Main Settings</h3>
      </center>
      <div className="settings-container" style={{ padding: '20px' }}>
        <h4>Miscellaneous Parameters</h4>
        <CButton
          color="info"
          size="sm"
          style={{ marginBottom: '20px' }}
          onClick={() => setShowDefaultMisc(!showDefaultMisc)}
        >
          {showDefaultMisc ? 'Hide Default Values' : 'Show Default Values'}
        </CButton>
        <CTable striped hover small>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '15%' }}>Slug</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '25%' }}>Name</CTableHeaderCell>
              {showDefaultMisc && (
                <CTableHeaderCell style={{ width: '20%' }}>Default Value</CTableHeaderCell>
              )}
              <CTableHeaderCell style={{ width: showDefaultMisc ? '30%' : '50%' }}>
                Active Value
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            <CTableRow>
              <CTableDataCell>neo4jCypherQueryUrl</CTableDataCell>
              <CTableDataCell>Neo4j Database Cypher Query URL Endpoint</CTableDataCell>
              {showDefaultMisc && (
                <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {defaults.neo4jCypherQueryUrl}
                </CTableDataCell>
              )}
              <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {editing.neo4jCypherQueryUrl ? (
                  <input
                    type="text"
                    defaultValue={activeValues.neo4jCypherQueryUrl}
                    onBlur={(e) => handleSave('neo4jCypherQueryUrl', e.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                    }}
                  />
                ) : (
                  activeValues.neo4jCypherQueryUrl
                )}
              </CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="secondary"
                  size="sm"
                  onClick={() => toggleEdit('neo4jCypherQueryUrl')}
                >
                  {editing.neo4jCypherQueryUrl ? 'Save' : 'Edit'}
                </CButton>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => handleRestore('neo4jCypherQueryUrl')}
                >
                  Restore
                </CButton>
              </CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableDataCell>trustScoreCutoff</CTableDataCell>
              <CTableDataCell>Trust Score Cutoff (0-100)</CTableDataCell>
              {showDefaultMisc && (
                <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {defaults.trustScoreCutoff}
                </CTableDataCell>
              )}
              <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                {editing.trustScoreCutoff ? (
                  <input
                    type="number"
                    defaultValue={activeValues.trustScoreCutoff}
                    onBlur={(e) => handleSave('trustScoreCutoff', e.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                    }}
                  />
                ) : (
                  activeValues.trustScoreCutoff
                )}
              </CTableDataCell>
              <CTableDataCell>
                <CButton color="secondary" size="sm" onClick={() => toggleEdit('trustScoreCutoff')}>
                  {editing.trustScoreCutoff ? 'Save' : 'Edit'}
                </CButton>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => handleRestore('trustScoreCutoff')}
                >
                  Restore
                </CButton>
              </CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>

        <h4>Canonical Knowledge Graph Concept UUIDs</h4>
        <CButton
          color="info"
          size="sm"
          style={{ marginBottom: '20px' }}
          onClick={() => setShowDefaultConcept(!showDefaultConcept)}
        >
          {showDefaultConcept ? 'Hide Default Values' : 'Show Default Values'}
        </CButton>
        <CTable striped hover small>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '15%' }}>Slug</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '20%' }}>
                List Header (Name of the Concept)
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '15%' }}>Neo4j Node Label</CTableHeaderCell>
              {showDefaultConcept && (
                <CTableHeaderCell style={{ width: '20%' }}>Default UUID</CTableHeaderCell>
              )}
              <CTableHeaderCell style={{ width: showDefaultConcept ? '20%' : '40%' }}>
                Active UUID
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {[
              'relationship',
              'relationshipType',
              'nodeType',
              'set',
              'superset',
              'JSONSchema',
              'property',
            ].map((key) => (
              <CTableRow key={key}>
                <CTableDataCell>{key}</CTableDataCell>
                <CTableDataCell>
                  {key === 'relationship'
                    ? 'relationships'
                    : key === 'relationshipType'
                      ? 'relationship types'
                      : key === 'nodeType'
                        ? 'node types'
                        : key === 'set'
                          ? 'sets'
                          : key === 'superset'
                            ? 'supersets'
                            : key === 'JSONSchema'
                              ? 'JSON schemas'
                              : 'properties'}
                </CTableDataCell>
                <CTableDataCell>
                  {key === 'relationship'
                    ? 'Relationship'
                    : key === 'relationshipType'
                      ? 'RelationshipType'
                      : key === 'nodeType'
                        ? 'NodeType'
                        : key === 'set'
                          ? 'Set'
                          : key === 'superset'
                            ? 'Superset'
                            : key === 'JSONSchema'
                              ? 'JSONSchema'
                              : 'Property'}
                </CTableDataCell>
                {showDefaultConcept && (
                  <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {defaults.conceptUUIDs[key]}
                  </CTableDataCell>
                )}
                <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {editing[key] ? (
                    <input
                      type="text"
                      defaultValue={activeValues[key]}
                      onBlur={(e) => handleSave(key, e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        padding: '10px',
                      }}
                    />
                  ) : (
                    activeValues[key]
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="secondary" size="sm" onClick={() => toggleEdit(key)}>
                    {editing[key] ? 'Save' : 'Edit'}
                  </CButton>
                  <CButton color="warning" size="sm" onClick={() => handleRestore(key)}>
                    Restore
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <h4>Relationship Type UUIDs</h4>
        <CButton
          color="info"
          size="sm"
          style={{ marginBottom: '20px' }}
          onClick={() => setShowDefaultRelationship(!showDefaultRelationship)}
        >
          {showDefaultRelationship ? 'Hide Default Values' : 'Show Default Values'}
        </CButton>
        <CTable striped hover small>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '20%' }}>Slug</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '20%' }}>Alias</CTableHeaderCell>
              {showDefaultRelationship && (
                <CTableHeaderCell style={{ width: '20%' }}>Default UUID</CTableHeaderCell>
              )}
              <CTableHeaderCell style={{ width: showDefaultRelationship ? '30%' : '50%' }}>
                Active UUID
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {[
              'CLASS_THREAD_INITIATION',
              'CLASS_THREAD_PROPAGATION',
              'CLASS_THREAD_TERMINATION',
              'IS_A_PROPERTY_OF',
              'IS_THE_JSON_SCHEMA_FOR',
              'ENUMERATES',
            ].map((key) => (
              <CTableRow key={key}>
                <CTableDataCell>{key}</CTableDataCell>
                <CTableDataCell>
                  {key === 'CLASS_THREAD_INITIATION'
                    ? 'IS_THE_CONCEPT_FOR'
                    : key === 'CLASS_THREAD_PROPAGATION'
                      ? 'IS_A_SUPERSET_OF'
                      : key === 'CLASS_THREAD_TERMINATION'
                        ? 'HAS_ELEMENT'
                        : ''}
                </CTableDataCell>
                {showDefaultRelationship && (
                  <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {defaults.relationshipTypeUUIDs[key]}
                  </CTableDataCell>
                )}
                <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {editing[key] ? (
                    <input
                      type="text"
                      defaultValue={activeValues[key]}
                      onBlur={(e) => handleSave(key, e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                        padding: '10px',
                      }}
                    />
                  ) : (
                    activeValues[key]
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="secondary" size="sm" onClick={() => toggleEdit(key)}>
                    {editing[key] ? 'Save' : 'Edit'}
                  </CButton>
                  <CButton color="warning" size="sm" onClick={() => handleRestore(key)}>
                    Restore
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        <h4>Relay Arrays</h4>
        <CButton
          color="info"
          size="sm"
          style={{ marginBottom: '20px' }}
          onClick={() => setShowDefaultRelay(!showDefaultRelay)}
        >
          {showDefaultRelay ? 'Hide Default Values' : 'Show Default Values'}
        </CButton>
        <CTable striped hover small>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '20%' }}>Slug</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '20%' }}>Supported Event Kinds</CTableHeaderCell>
              {showDefaultRelay && (
                <CTableHeaderCell style={{ width: '20%' }}>Default Relays</CTableHeaderCell>
              )}
              <CTableHeaderCell style={{ width: showDefaultRelay ? '30%' : '50%' }}>
                Active Relays
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {[
              'aPopularGeneralPurposeRelays',
              'aDListRelays',
              'aTrustedAssertionRelays',
              'aTrustedListRelays',
              'aWotRelays',
              'aProfileRelays',
              'aOutboxRelays',
            ].map((key) => (
              <CTableRow key={key}>
                <CTableDataCell
                  onClick={() =>
                    handleRelayClick(
                      key,
                      key === 'aPopularGeneralPurposeRelays'
                        ? 'aPopularGeneralPurposeRelays: As the name implies. We will look for 10040 events here (among other places). We may also use these to look for curation-related events like kind 7 reactions.'
                        : key === 'aDListRelays'
                          ? 'aDListRelays: These relays support the DLists Custom Nip. These relays will accept kinds 9998, 9999, 39998, 39999 events. They may also accept kinds 7 events and any other events that may gain usage for curation of DLists.'
                          : key === 'aTrustedAssertionRelays'
                            ? 'aTrustedAssertionRelays: These relays support the Trusted Assertion Custom NIP. They should accept kinds 3038x events as per the NIP.'
                            : key === 'aTrustedListRelays'
                              ? 'aTrustedListRelays: These relays support the Trusted List Custom NIP. They should accept kinds 3039x events as per the NIP.'
                              : key === 'aWotRelays'
                                ? 'aWotRelays: These relays support calculation of GrapeRank by Brainstorm instances.'
                                : key === 'aProfileRelays'
                                  ? 'aProfileRelays: These are relays known to support kind 0 events (not including general purpose relays). Brainstorm: Knowledge Graph may use other relays, such as aPopularGeneralPurposeRelays or aOutboxRelays, in addition to aProfileRelays to look for kind 0 events.'
                                  : 'aOutboxRelays: These support the Outbox model. Kind 10040 events will be published to aPopularGeneralPurposeRelays as well as the user’s aOutboxRelays.',
                    )
                  }
                >
                  {key}
                </CTableDataCell>
                <CTableDataCell>
                  {key === 'aDListRelays'
                    ? '9998,9999,39998,39999'
                    : key === 'aTrustedAssertionRelays'
                      ? '3038x'
                      : key === 'aTrustedListRelays'
                        ? '3039x'
                        : key === 'aWotRelays'
                          ? '3, 1984, 10000'
                          : key === 'aProfileRelays'
                            ? '0'
                            : ''}
                </CTableDataCell>
                {showDefaultRelay && (
                  <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                    {JSON.stringify(defaults.aRelays[key])}
                  </CTableDataCell>
                )}
                <CTableDataCell style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                  {editing[key] ? (
                    <textarea
                      defaultValue={JSON.stringify(activeValues[key], null, 2)}
                      onBlur={(e) => handleSave(key, JSON.parse(e.target.value))}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    JSON.stringify(activeValues[key])
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton color="secondary" size="sm" onClick={() => toggleEdit(key)}>
                    {editing[key] ? 'Save' : 'Edit'}
                  </CButton>
                  <CButton color="warning" size="sm" onClick={() => handleRestore(key)}>
                    Restore
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div
          id="relayInformationBox"
          style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}
        >
          {relayInfo}
        </div>
        <CButton
          color="primary"
          onClick={handleResetAll}
          style={{ float: 'right', marginTop: '20px', marginBottom: '20px' }}
        >
          Reset All to Default
        </CButton>
      </div>
    </>
  )
}

export default Settings
