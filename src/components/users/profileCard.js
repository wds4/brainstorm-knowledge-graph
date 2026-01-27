import React, { useState, useEffect } from 'react'
import { useNdk } from 'nostr-hooks'
import { CAvatar, CCard, CCardBody, CRow, CCol } from '@coreui/react'
import { asyncFetchProfile } from 'src/helpers/ndk'
import { noProfilePicUrl } from 'src/const'

const aDListRelays = JSON.parse(sessionStorage.getItem('aDListRelays') || '[]')

const ProfileCard = ({ pubkey }) => {
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

  console.log('rerender ProfileCard')

  return (
    <CCard
      style={{
        marginBottom: '20px',
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <CCardBody
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0' }}
      >
        <CRow style={{ width: '100%', alignItems: 'center' }}>
          <CCol style={{ paddingLeft: '30px' }}>
            <h5 style={{ margin: '0', fontSize: '1.25rem' }}>Author: </h5>
          </CCol>
          <CCol xs="auto" style={{ paddingRight: '0' }}>
            <CAvatar
              style={{
                backgroundColor: 'grey',
                width: '60px',
                height: '60px',
              }}
              src={profilePicUrl}
            />
          </CCol>
          <CCol style={{ paddingLeft: '15px' }}>
            <h3 style={{ margin: '0', fontSize: '2rem' }}>{profileDisplayName}</h3>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default ProfileCard
