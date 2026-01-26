import React, { useMemo, useState, useEffect } from 'react'
import { useNdk } from 'nostr-hooks'
import { CAvatar } from '@coreui/react'
import { asyncFetchProfile } from 'src/helpers/ndk'
import { noProfilePicUrl } from 'src/const'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const AvatarBig = ({ pubkey }) => {
  const { ndk } = useNdk()
  const [profilePicUrl, setProfilePicUrl] = useState(noProfilePicUrl)
  const [profileDisplayName, setProfileDisplayName] = useState('')

  useEffect(() => {
    const updateProfilePic = async () => {
      const obj = {}
      obj.pubkey = pubkey
      const oProfile = await asyncFetchProfile(ndk, obj)
      setProfilePicUrl(oProfile?.image)
      const displayName = oProfile?.display_name || oProfile?.name || oProfile?.pubkey
      setProfileDisplayName(displayName)
    }
    updateProfilePic()
  }, [pubkey])

  console.log('rerender AvatarBig')

  return (
    <CAvatar
      style={{
        backgroundColor: 'grey',
        width: '200px',
        height: '200px',
      }}
      src={profilePicUrl}
      size="lg"
      title={profileDisplayName}
    />
  )
}

export default AvatarBig
