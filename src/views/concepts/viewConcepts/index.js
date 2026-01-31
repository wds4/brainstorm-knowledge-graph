import React from 'react'
import ConceptsCypherQuery from './conceptsCypherQuery'
import { useActiveUser } from 'nostr-hooks'

const ViewConcepts = () => {
  const { activeUser } = useActiveUser()

  if (!activeUser) return <p>Not logged in</p>
  return (
    <>
      <center>
        <h3>View Concepts</h3>
      </center>
      <ConceptsCypherQuery />
    </>
  )
}

export default ViewConcepts
