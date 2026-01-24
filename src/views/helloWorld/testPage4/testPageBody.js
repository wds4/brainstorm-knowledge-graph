import React, { useEffect, useState } from 'react'
import { useNdk } from 'nostr-hooks'
import { asyncFetchProfile } from 'src/helpers/ndk'

const npub = 'npub1u5njm6g5h5cpw4wy8xugu62e5s7f6fnysv0sj0z3a8rengt2zqhsxrldq3'

const TestPageBody = () => {
  const { ndk } = useNdk()
  const [profile, setProfile] = useState({})

  useEffect(() => {
    const updateProfile = async () => {
      const obj = {}
      obj.npub = npub
      const oProfile = await asyncFetchProfile(ndk, obj)
      setProfile(oProfile)
    }
    updateProfile()
  }, [])

  console.log('rerender TestPageBody for test page 4')
  return (
    <>
      <center>
        <h3>nostr-hooks: useNdk</h3>
      </center>
      <p>
        This page uses ndk to create a customized function asyncFetchProfile which is then used to
        fetch a profile using a hardcoded pubkey.
      </p>
      <p>
        Advantage over the useProfile function from nostr-hooks: this component does not rerender
        forever.
      </p>
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
