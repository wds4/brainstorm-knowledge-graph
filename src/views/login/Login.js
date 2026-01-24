import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CCardTitle,
  CForm,
  CFormInput,
  CRow,
} from '@coreui/react'
import { isHex, safeDecode } from 'src/helpers/nip19'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { bytesToHex } from '@noble/hashes/utils'
import { useLogin, useActiveUser } from 'nostr-hooks'

const Extension = () => {
  const { loginWithExtension } = useLogin()
  const navigate = useNavigate()

  const handleExtensionSigner = () => {
    loginWithExtension({
      onError: (e) => {
        console.error(e)
      },
      onSuccess: () => {
        navigate('/')
      },
    })
  }
  return (
    <>
      <div className="d-grid gap-2">
        <CButton color="primary" onClick={() => handleExtensionSigner()}>
          Login with extension
        </CButton>
      </div>
      <div style={{ textAlign: 'center' }}>Don't have an extension yet?</div>
      <div style={{ textAlign: 'center' }}>
        Get yours from{' '}
        <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noreferrer">
          Nos2x
        </a>{' '}
        or{' '}
        <a href="https://getalby.com" target="_blank" rel="noreferrer">
          Alby
        </a>
      </div>
    </>
  )
}

const RemoteSigner = () => {
  const [error, setError] = useState(false)
  const [nip05Address, setNip05Address] = useState('')

  const { loginWithRemoteSigner } = useLogin()
  const navigate = useNavigate()

  const handleRemoteSigner = () => {
    loginWithRemoteSigner({
      nip46Address: nip05Address, // nip46Input,
      onError: (e) => {
        console.error(e)
      },
      onSuccess: () => {
        navigate('/')
      },
    })
  }

  const handleInputChange = useCallback(
    (e) => {
      setNip05Address(e.target.value)
      try {
      } catch (e) {
        setError(true)
      }
    },
    [setNip05Address, setError],
  )
  return (
    <>
      <div>Your NIP-05 address:</div>
      <CForm>
        <CFormInput
          type="text"
          placeholder="your@nsec.app"
          required
          value={nip05Address}
          onChange={handleInputChange}
          invalid={error}
        />
      </CForm>
      <br />
      <div className="d-grid gap-2">
        <CButton color="primary" onClick={() => handleRemoteSigner()}>
          Login with remote signer
        </CButton>
      </div>
      <div style={{ textAlign: 'center' }}>Don't have a remote signer yet?</div>
      <div style={{ textAlign: 'center' }}>
        Set yours up at{' '}
        <a href="https://nsec.app" target="_blank" rel="noreferrer">
          nsec.app
        </a>
      </div>
    </>
  )
}

const SecretKey = () => {
  const [error, setError] = useState(false)
  const [nsec, setNsec] = useState('')
  const [hexKey, setHexKey] = useState('')
  const [npub, setNpub] = useState('')
  const [pubkey, setPubkey] = useState('')

  const { loginWithSecretKey } = useLogin()
  const navigate = useNavigate()

  const handleSecretKeySigner = () => {
    loginWithSecretKey({
      secretKey: nsec, // nsecInput,
      onError: (e) => {
        console.error(e)
      },
      onSuccess: () => {
        navigate('/')
      },
    })
  }

  const generateNewSecretKey = useCallback(() => {
    const hex = generateSecretKey() // for up to date nostr-tools
    // const hex = generatePrivateKey() // for nostr-tools 1.14.0
    const pubkey_ = getPublicKey(hex)
    const hexKey_ = bytesToHex(hex)
    const nsec_ = nip19.nsecEncode(hex)
    const npub_ = nip19.npubEncode(pubkey_)
    setHexKey(hexKey_)
    setNsec(nsec_)
    setNpub(npub_)
    setPubkey(pubkey_)
  }, [setHexKey, setNsec])

  const handleInputChange = useCallback(
    (e) => {
      setNsec(e.target.value)

      try {
        let hex = null
        if (isHex(e.target.value)) hex = e.target.value
        else {
          const decode = safeDecode(e.target.value)
          if (decode && decode.type === 'nsec') hex = bytesToHex(decode.data)
        }

        if (hex) {
          const pubkey = getPublicKey(hexToBytes(hex))
          setHexKey(hex)
          setNpub(nip19.npubEncode(pubkey))
          setError(false)
        } else {
          setError(true)
        }
      } catch (e) {
        setError(true)
      }
    },
    [setNsec, setHexKey, setNpub, setError],
  )

  return (
    <>
      <div>Your secret key:</div>
      <CForm>
        <CFormInput
          type="text"
          placeholder="nsec (to do: allow nsec or hex)"
          required
          value={nsec}
          onChange={handleInputChange}
          invalid={error}
        />
      </CForm>
      <br />
      <div className="d-grid gap-2">
        <CButton color="primary" onClick={() => handleSecretKeySigner()}>
          Login with secret key
        </CButton>
      </div>
      <br />
      <div style={{ textAlign: 'center' }}>Don't have a secret key yet?</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'blue' }} onClick={() => generateNewSecretKey()}>
          Generate a new secret key
        </div>
      </div>
    </>
  )
}

const DisambiguateLoginMethod = ({ loginMethod }) => {
  if (loginMethod == 'extension') {
    return <Extension />
  }
  if (loginMethod == 'remoteSigner') {
    return <RemoteSigner />
  }
  if (loginMethod == 'secretKey') {
    return <SecretKey />
  }
  return <>error</>
}

const LoginNostrHooks = () => {
  const { loginFromLocalStorage, logout } = useLogin()
  const { activeUser } = useActiveUser()
  const [loginMethod, setLoginMethod] = useState('extension')
  useEffect(() => {
    loginFromLocalStorage({})
  }, [])
  return (
    <>
      <CContainer md style={{ marginTop: '50px' }}>
        <CRow className="justify-content-center">
          <div className="col-auto">
            <CCard className="w-80">
              <CCardBody>
                <center>
                  <CCardTitle>Nostr Login</CCardTitle>
                </center>
              </CCardBody>
              <CCardBody>
                <div >
                  <CButton
                    active={loginMethod == 'extension'}
                    onClick={() => setLoginMethod('extension')}
                  >
                    Extension
                  </CButton>
                  <CButton
                    active={loginMethod == 'remoteSigner'}
                    onClick={() => setLoginMethod('remoteSigner')}
                  >
                    Remote Signer
                  </CButton>
                  <CButton
                    active={loginMethod == 'secretKey'}
                    onClick={() => setLoginMethod('secretKey')}
                  >
                    Secret Key
                  </CButton>
                </div>
              </CCardBody>
              <CCardBody>
                <DisambiguateLoginMethod loginMethod={loginMethod} />
              </CCardBody>
            </CCard>
          </div>
        </CRow>
      </CContainer>
    </>
  )
}

export default LoginNostrHooks
