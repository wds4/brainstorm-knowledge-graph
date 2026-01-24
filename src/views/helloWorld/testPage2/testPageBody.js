import React from 'react'
import { useActiveUser } from 'nostr-hooks'

const UseActiveUser = () => {
  const { activeUser } = useActiveUser()

  console.log('rerender UseActiveUser')

  if (!activeUser) return <p>Not logged in</p>

  return (
    <>
      <center>
        <h3>nostr-hooks: useActiveUser</h3>
      </center>
      <div>
        <p>activeUser.pubkey: {activeUser.pubkey}</p>
        <p>JSON.stringify(activeUser, null, 4): </p>
        <pre>{JSON.stringify(activeUser, null, 4)}</pre>
        <p>JSON.stringify(Object.keys(activeUser.ndk), null, 4): </p>
        <pre>{JSON.stringify(Object.keys(activeUser.ndk), null, 4)}</pre>
      </div>
    </>
  )
}

export default UseActiveUser
