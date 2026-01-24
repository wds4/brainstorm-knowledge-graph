import React, { useMemo } from 'react'
import { useSubscribe } from 'nostr-hooks'

/*
REACT RERENDERING HELL

If we define filters 1) in the same component that use use to call useSubscribe and 2) we do it without memoization,
then each response (an array of events) received from useSubscribe triggers the component to be rerendered,
which triggers filter to be redefined, which triggers useSubscribe to be called again from scratch,
which means the flow of events starts over, so we get another render when the first events array is received.
We never get past the array of empty events.
Welcome to react infinite loop rerendering hell.
When running SubscribeToEvents_infiniteRerenderingHell, look in the javascript console, find
rerender SubscribeToEvents_infiniteRerenderingHell; events.length: 0
and note that events is empty every time. Rerendering happens even before the first event is received.

Two ways to fix this:
1. Define filters outside of the component that calls useSubscribe.
2. Memoization, which prevents variables from being redefined upon rerenders
*/

const SubscribeToEvents_infiniteRerenderingHell = () => {
  const pubkey1 = 'e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f'

  // defining filters in same component as useSubscribe without memoization causes rerendering hell
  const filters = [{ authors: [pubkey1], kinds: [1], limit: 10 }]

  const { events } = useSubscribe({ filters })
  console.log('rerender SubscribeToEvents_infiniteRerenderingHell; events.length: ' + events.length)
  if (!events) {
    return (
      <>
        <div>No events</div>
      </>
    )
  }
  return (
    <>
      <center>
        <h3>nostr-hooks: useSubscribe</h3>
      </center>
      <div>
        <p>number of events: {events.length}</p>
        <p>Note the use of useMemo to prevent an infinite rerendering loop.</p>
        <p>
          Look for "rerender SubscribeToEvents_memoization" in javascript console; it should rerender once for
          each new event received.
        </p>
        <p>
          filters: <br />
          {JSON.stringify(filters, null, 4)}
        </p>
        <ul>
          {events.map((event, item) => (
            <li key={event.id}>
              <p>
                id {item}: {event.id}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const SubscribeToEvents_memoization = () => {
  const pubkey1 = 'e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f'

  // useMemo prevents rerendering hell
  const filters = useMemo(() => [{ authors: [pubkey1], kinds: [1], limit: 10 }], [])

  const { events } = useSubscribe({ filters })
  console.log('rerender SubscribeToEvents_memoization; events.length: ' + events.length)
  if (!events) {
    return (
      <>
        <div>No events</div>
      </>
    )
  }
  return (
    <>
      <center>
        <h3>useSubscribe</h3>
      </center>
      <div>
        <p>number of events: {events.length}</p>
        <p>Note the use of useMemo to prevent an infinite rerendering loop.</p>
        <p>
          Look for "rerender SubscribeToEvents_memoization" in javascript console; it should rerender once for
          each new event received.
        </p>
        <p>
          filters: <br />
          {JSON.stringify(filters, null, 4)}
        </p>
        <ul>
          {events.map((event, item) => (
            <li key={event.id}>
              <p>
                id {item}: {event.id}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const DisplayEvents = ({ filters }) => {
  const { events } = useSubscribe({ filters })
  console.log('rerender DisplayEvents; events.length: ' + events.length)
  if (!events) {
    return (
      <>
        <div>No events</div>
      </>
    )
  }
  return (
    <div>
      <p>number of events: {events.length}</p>
      <ul>
        {events.map((event, item) => (
          <li key={event.id}>
            <p>
              id {item}: {event.id}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
const SubscribeToEvents_parentChild = ({}) => {
  const pubkey1 = 'e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f'

  const filters = [{ authors: [pubkey1], kinds: [1], limit: 10 }]

  console.log('rerender SubscribeToEvents_parentChild')

  return (
    <>
      <center>
        <h3>useSubscribe</h3>
      </center>
      <p>Note the use of parent - child components to prevent an infinite rerendering loop.</p>
      <p>
        Look for "rerender SubscribeToEvents_parentChild" in javascript console; it should rerender once for
        each new event received.
      </p>
      <p>
        filters: <br />
        {JSON.stringify(filters, null, 4)}
      </p>
      <DisplayEvents filters={filters} />
    </>
  )
}

/*
Try each of the below methods and see how many rerenders are recorded in the console. Pay attention to the
length of events with each rerender.
*/

// export default SubscribeToEvents_infiniteRerenderingHell // does not work
export default SubscribeToEvents_memoization // works
// export default SubscribeToEvents_parentChild // works
