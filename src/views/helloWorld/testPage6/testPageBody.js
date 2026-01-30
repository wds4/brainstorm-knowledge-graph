import React, { useState } from 'react'
import { CButton, CSpinner, CAlert } from '@coreui/react'

const TestPageBody = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const testNeo4jConnection = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    const endpoint = 'http://straycat.brainstorm.social:7474/db/data/transaction/commit'

    const cypherQuery = {
      statements: [
        {
          statement: 'MATCH (n) RETURN n LIMIT 5',
          resultDataContents: ['row', 'graph'],
        },
      ],
    }

    const username = 'neo4j'
    const password = 'neo4jneo4j'
    const credentials = btoa(`${username}:${password}`)
    console.log(`Basic ${credentials}`)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(cypherQuery),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <center>
        <h3>Neo4j Connection Test</h3>
      </center>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p>
            <strong>Endpoint:</strong>{' '}
            https://straycat.brainstorm.social:7474/db/data/transaction/commit
          </p>
          <p>
            <strong>Test Query:</strong> MATCH (n) RETURN n LIMIT 5
          </p>
        </div>

        <CButton color="primary" onClick={testNeo4jConnection} disabled={loading}>
          {loading ? (
            <>
              <CSpinner size="sm" /> Testing...
            </>
          ) : (
            'Test Connection'
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
              <strong>Connection Successful!</strong>
            </CAlert>
            <div style={{ marginTop: '10px' }}>
              <h5>Results:</h5>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
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
