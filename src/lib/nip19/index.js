import { nip19 } from 'nostr-tools'

export const validateUUID = (uuid) => {
  // returns object: { uuid, uuidType, valid, error }

  if (!uuid) {
    return { uuid, uuidType: 'invalid', valid: false, error: 'no UUID provided' }
  }

  if (typeof uuid !== 'string') {
    return { uuid, uuidType: 'invalid', valid: false, error: 'UUID is not a string' }
  }

  // check if uuid is an aTag
  if (uuid.includes(':')) {
    const parts = uuid.split(':')
    if (parts.length === 3) {
      // make sure kind field (parts[0]) is a number
      if (isNaN(parseInt(parts[0]))) {
        return { uuid, uuidType: 'invalid', valid: false, error: 'kind is not a number' }
      }

      // make sure dTag field (parts[2]) is a string
      if (typeof parts[2] !== 'string') {
        return { uuid, uuidType: 'invalid', valid: false, error: 'dTag field is not a string' }
      }

      // make sure pubkey field (parts[1]) is a string
      if (typeof parts[1] !== 'string') {
        return { uuid, uuidType: 'invalid', valid: false, error: 'pubkey field is not a string' }
      }

      // make sure pubkey field (parts[1]) is a valid pubkey
      try {
        // I think this will throw an error if the pubkey is not valid
        const npub = nip19.npubEncode(parts[1])
        console.log(`validateUUID; aTag with author npub: ${npub}`)
        // if no error, then pubkey is valid
        return { uuid, uuidType: 'aTag', valid: true, error: '' }
      } catch (error) {
        console.log(`validateUUID; error: ${error}`)
        return { uuid, uuidType: 'invalid', valid: false, error: 'pubkey is not valid' }
      }
    }
  }

  return { uuid, uuidType: 'unknown', valid: false, error: 'unknown error' }
}
