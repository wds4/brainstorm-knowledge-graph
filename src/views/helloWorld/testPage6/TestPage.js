import React from 'react'
import { useSelector } from 'react-redux'
import TestPageBody from './testPageBody'
import { useActiveUser } from 'nostr-hooks'

const TestPage = () => {
  const { activeUser } = useActiveUser()

  if (!activeUser) return <p>Not logged in</p>
  return (
    <>
      <center>
        <h3>Test Page 6</h3>
      </center>
      <TestPageBody />
    </>
  )
}

export default TestPage
