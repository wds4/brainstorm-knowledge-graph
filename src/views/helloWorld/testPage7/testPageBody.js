import React, { useState } from 'react'
import { CButton, CSpinner, CAlert } from '@coreui/react'
import neo4j from 'neo4j-driver'

const TestPageBody = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const uri1 = 'bolt://straycat.brainstorm.social:7687'
  const username1 = 'neo4j'
  const password1 = 'neo4jneo4j'

  const uri2 = 'bolt://orly.ft.hn:7687'
  const username2 = 'neo4j'
  const password2 = 'TqxmB73JwAfXkqvBINvg'

  const uri3 = 'bolt://testorly.nosfabrica.com:7687'
  const username3 = 'neo4j'
  const password3 = 'nosfabricaadminpassword505freedom'

  const query1 = 'MATCH (n) RETURN n LIMIT 5'
  const query2 =
    'MATCH n = (listHeader)-[:IS_THE_CONCEPT_FOR]->(superset:Superset)-[:IS_A_SUPERSET_OF]->()-[:HAS_ELEMENT]->() RETURN n'

  const uri = uri2
  const username = username2
  const password = password2

  const query = query2

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

      const records = result.records.map((record) => {
        return {
          node: record.get('n'),
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
          <p>
            <strong>URI:</strong> {uri}
          </p>
          <p>
            <strong>Query:</strong> {query}
          </p>
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
