import React, { useMemo } from 'react'
import { useProfile } from 'nostr-hooks'

const pubkey = 'e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f'

const TestPageBody = () => {
  // const pubkey = useMemo(() => "e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f", []) // doesn't help
  const { profile } = useProfile({ pubkey })

  console.log('rerender TestPageBody, Test Page 3')

  if (!profile) return <div>no profile</div>
  return (
    <>
      <center>
        <h3>nostr-hooks: useProfile</h3>
      </center>
      <p>
        This page uses the useProfile function from nostr-hooks to fetch a profile using a hardcoded
        pubkey.
      </p>
      <p>
        Problem: This component gets rerendered over and over, as seen in the javascript console
        where 'rerender TestPageBody, Test Page 3' is logged with each rerender.
      </p>
      <p>
        Solution: See test page 4, where I employ an asynchronous function: asyncFetchProfile. (Did
        I just reinvent the wheel?)
      </p>
      <hr />
      <div>
        <p>name: {profile?.name}</p>
        <p>displayName: {profile?.displayName}</p>
        <p>website: {profile?.website}</p>
        <p>banner: {profile?.banner}</p>
        <p>about: {profile?.about}</p>
        <p>image: {profile?.image}</p>
      </div>
    </>
  )
}

export default TestPageBody
