import { useNdk } from 'nostr-hooks'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { asyncFetchProfile } from 'src/helpers/ndk'

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [providedNpub, setProvidedNpub] = useState('')
  const [providedPubkey, setProvidedPubkey] = useState('')
  const [profile, setProfile] = useState({})

  const { ndk } = useNdk()

  useEffect(() => {
    let internalNpub = ''
    let internaPubkey = ''
    function updateUserDataFromUrl() {
      const npubFromUrl = searchParams.get('npub')
      if (npubFromUrl) {
        setProvidedNpub(npubFromUrl)
        internalNpub = npubFromUrl
      }
      const pubkeyFromUrl = searchParams.get('pubkey')
      if (pubkeyFromUrl) {
        setProvidedPubkey(pubkeyFromUrl)
        internaPubkey = pubkeyFromUrl
      }
    }
    updateUserDataFromUrl()
    const updateProfile = async () => {
      if (internalNpub) {
        const obj = {}
        obj.npub = internalNpub
        const oProfile = await asyncFetchProfile(ndk, obj)
        setProfile(oProfile)
        return true
      }
      if (internaPubkey) {
        const obj = {}
        obj.pubkey = internaPubkey
        const oProfile = await asyncFetchProfile(ndk, obj)
        setProfile(oProfile)
        return true
      }
      return false
    }
    updateProfile()
  }, [])

  console.log('Profile component rerender')

  return (
    <>
      <center>
        <h3>Profile</h3>
      </center>
      <p>
        include ?npub=(npub) or ?pubkey=(pubkey) to the above url to look up data using the useNdk
        function of nostr-hooks. If both are present, the provided npub will be used.
      </p>
      <div>
        <p>providedNpub: {providedNpub}</p>
        <p>providedPubkey: {providedPubkey}</p>
        <p>profile:</p>
        <pre>{JSON.stringify(profile, null, 4)}</pre>
      </div>
    </>
  )
}

export default Profile
