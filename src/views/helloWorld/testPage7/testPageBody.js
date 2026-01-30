import React, { useState } from 'react'
import { CButton, CSpinner, CAlert, CFormSelect, CFormTextarea } from '@coreui/react'
import neo4j from 'neo4j-driver'

const TestPageBody = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [neo4jBoltSelected, setNeo4jBoltSelected] = useState(0)
  // const [cypherQuerySelected, setCypherQuerySelected] = useState(0)

  const aUriOptions = []
  const aUsernameOptions = []
  const aPasswordOptions = []

  const queryOptions = []

  aUriOptions[0] = 'bolt://testorly.nosfabrica.com:7687'
  aUsernameOptions[0] = 'neo4j'
  aPasswordOptions[0] = 'nosfabricaadminpassword505freedom'

  aUriOptions[1] = 'bolt://straycat.brainstorm.social:7687'
  aUsernameOptions[1] = 'neo4j'
  aPasswordOptions[1] = 'neo4jneo4j'

  aUriOptions[2] = 'bolt://orly.ft.hn:7687'
  aUsernameOptions[2] = 'neo4j'
  aPasswordOptions[2] = 'TqxmB73JwAfXkqvBINvg'

  queryOptions[0] = 'MATCH (n) RETURN n LIMIT 5'
  queryOptions[1] =
    'MATCH n = (listHeader)-[:IS_THE_CONCEPT_FOR]->(superset:Superset)-[:IS_A_SUPERSET_OF *0..5]->()-[:HAS_ELEMENT]->() RETURN n'

  const neo4jBoltOptions = [0, 1, 2]

  const uri = aUriOptions[neo4jBoltSelected]
  const username = aUsernameOptions[neo4jBoltSelected]
  const password = aPasswordOptions[neo4jBoltSelected]

  const defaultQuery = queryOptions[0]
  const [customQuery, setCustomQuery] = useState(defaultQuery)
  const query = customQuery || defaultQuery

  const testNeo4jBoltConnection = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    let driver
    let session

    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(username, password))

      await driver.verifyConnectivity()

      session = driver.session()

      const result = await session.run(query)

      /*
      const records = result.records.map((record) => {
        const obj = {}
        record.keys.forEach((key) => {
          obj[key] = record.get(key)
        })
        return obj
      })
      */

      /*
      const records = result.records.map((record) => {
        return {
          node: record.get('foo'),
        }
      })
      */

      const records = result.records.map((record) => {
        return {
          node: record
        }
      })

      setResults({
        success: true,
        recordCount: records.length,
        records: records,
        summary: result.summary,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      if (session) {
        await session.close()
      }
      if (driver) {
        await driver.close()
      }
      setLoading(false)
    }
  }

  return (
    <>
      <center>
        <h3>Neo4j Cypher Query Test: BOLT</h3>
      </center>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="neo4jInstanceSelect" style={{ marginBottom: '5px', display: 'block' }}>
              <strong>Select Neo4j Instance:</strong>
            </label>
            <CFormSelect
              id="neo4jInstanceSelect"
              value={neo4jBoltSelected}
              onChange={(e) => setNeo4jBoltSelected(Number(e.target.value))}
              style={{ maxWidth: '500px' }}
            >
              {neo4jBoltOptions.map((optionIndex) => (
                <option key={optionIndex} value={optionIndex}>
                  {aUriOptions[optionIndex]}
                </option>
              ))}
            </CFormSelect>
          </div>
          <p>
            <strong>URI:</strong> {uri}
          </p>
          <div style={{ marginTop: '15px' }}>
            <label htmlFor="cypherQueryInput" style={{ marginBottom: '5px', display: 'block' }}>
              <strong>Cypher Query:</strong>
            </label>
            <CFormTextarea
              id="cypherQueryInput"
              rows={4}
              placeholder={defaultQuery}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '14px' }}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Leave empty to use default query
            </small>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>Basic neo4j query:</small>
              <small>MATCH (n) RETURN n LIMIT 5</small>
            </div>
            <div>FROM orly.ft.hn:</div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all class threads:
              </small>
              <small>
                MATCH classPath =
                (listHeader)-[:IS_THE_CONCEPT_FOR]-&gt;(superset:Superset)-[:IS_A_SUPERSET_OF
                *0..5]-&gt;()-[:HAS_ELEMENT]-&gt;() <br></br>
                RETURN classPath
              </small>
            </div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all class threads originating from the list header for dog:
              </small>
              <small>
                MATCH classPath =
                (listHeader)-[:IS_THE_CONCEPT_FOR]-&gt;(superset:Superset)-[:IS_A_SUPERSET_OF
                *0..5]-&gt;()-[:HAS_ELEMENT]-&gt;()
                <br></br>
                WHERE listHeader.uuid =
                &apos;39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:b08502ed-9adf-42b4-9e10-ef3090179346&apos;
                <br></br>
                RETURN classPath
              </small>
            </div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all Irish Setters:
              </small>
              <small>
                MATCH p = (set)-[:IS_A_SUPERSET_OF *0..5]-&gt;()-[:HAS_ELEMENT]-&gt;(dog)
                <br></br>
                WHERE set.uuid =
                &apos;39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:3d73c366-00de-4274-a155-0029f952b06a&apos;
                <br></br>
                RETURN dog
              </small>
            </div>
            <div>ONCE WE POPULATE testorly.nosfabrica.com, we can run:</div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all Musicians (from tbd):
              </small>
              <small>tbd</small>
            </div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all jazz Musicians (from tbd):
              </small>
              <small>tbd</small>
            </div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all jazz Musicians authored by trusted pubkey (from relay tbd):
              </small>
              <small>tbd</small>
            </div>
            <div
              style={{
                marginTop: '5px',
                display: 'block',
                padding: '5px',
                border: '1px solid #ccc',
              }}
            >
              <small style={{ marginTop: '5px', display: 'block' }}>
                Return all jazz Musicians authored by trusted pubkey AND upvoted by at least one
                trusted pubkey (from relay tbd):
              </small>
              <small>tbd</small>
            </div>
          </div>
        </div>

        <CButton color="primary" onClick={testNeo4jBoltConnection} disabled={loading}>
          {loading ? (
            <>
              <CSpinner size="sm" /> Testing...
            </>
          ) : (
            'Test Bolt Connection'
          )}
        </CButton>

        {error && (
          <CAlert color="danger" style={{ marginTop: '20px' }}>
            <strong>Error:</strong> {error}
          </CAlert>
        )}

        {results && (
          <div style={{ marginTop: '20px' }}>
            <CAlert color="success">
              <strong>Connection Successful!</strong> Retrieved {results.recordCount} records
            </CAlert>
            <div style={{ marginTop: '10px' }}>
              <h5>Results:</h5>
              <pre
                style={{
                  padding: '15px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxHeight: '500px',
                }}
              >
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default TestPageBody
