import React, { useMemo, useState, useEffect } from 'react'
import { useNdk } from 'nostr-hooks'
import { CAvatar } from '@coreui/react'
import { asyncFetchProfile } from 'src/helpers/ndk'
import { noProfilePicUrl } from 'src/const'

const AuthorAvatar = ({ author }) => {
  const { ndk } = useNdk()
  const [profilePicUrl, setProfilePicUrl] = useState(noProfilePicUrl)
  const [profileDisplayName, setProfileDisplayName] = useState('')

  useEffect(() => {
    const updateProfilePic = async () => {
      const obj = {}
      obj.pubkey = author
      const oProfile = await asyncFetchProfile(ndk, obj)
      setProfilePicUrl(oProfile?.image)
      const displayName = oProfile?.display_name || oProfile?.name || oProfile?.pubkey
      setProfileDisplayName(displayName)
    }
    updateProfilePic()
  }, [author])

  console.log('rerender Avatar')

  return (
    <CAvatar
      style={{
        backgroundColor: 'grey',
      }}
      src={profilePicUrl}
      size="md"
      title={profileDisplayName}
    />
  )
}

export default AuthorAvatar
