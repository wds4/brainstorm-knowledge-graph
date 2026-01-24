import React, { useState } from 'react'
import { useNewEvent, useSigner } from 'nostr-hooks'

const TestPageBody = () => {
  const [content, setContent] = useState('')
  const { signer } = useSigner()

  const { createNewEvent } = useNewEvent()

  const handlePublish = () => {
    const event = createNewEvent()
    event.content = content
    event.kind = 1

    signer.sign(event)

    console.log('event: ' + JSON.stringify(event, null, 4))
    event.publish()
  }
  return (
    <>
      <center>
        <h3>nostr-hooks: useNewEvent, useSigner</h3>
      </center>
      <div>
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={() => handlePublish()}>Publish Note</button>
      </div>
    </>
  )
}

export default TestPageBody
