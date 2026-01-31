import React from 'react'

const ConceptsTable = ({ results }) => {
  const records = results.records.map((record) => {
    return {
      node: record,
    }
  })
  return (
    <>
      <center>
        <h3>Concepts Table</h3>
      </center>
      <div style={{ marginTop: '10px' }}>
        <h5>Records: {records.length}</h5>
        {records.map((record, index) => {
          const node = record.node.node
          const fields = node._fields
          return (
            <div key={index}>
              <h5>{index}</h5>
              <pre style={{ fontSize: '10px', border: '1px solid #ccc', padding: '5px' }}>
                {JSON.stringify(fields, null, 2)}
              </pre>
            </div>
          )
        })}
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
    </>
  )
}

export default ConceptsTable
