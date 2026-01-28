import React from 'react'

const EditCuration = () => {
  return (
    <>
      <center>
        <h3>Edit Curation of this list</h3>
      </center>
      <div>
        <p>
          The default method of curation is to count NIP-25, kind 7 &quot;+&quot; and &quot;-&quot;
          reactions and to discard any reactions authored by a user whose Trusted Assertions rank
          score is below the cutoff in settings.
        </p>
        <p>
          In the future, you will be able to customize this curation method. For example, if a
          system of feedback that is not based on kind 7 events were to become popularized, you
          might want to use that data instead; or perhaps you will want to merge these souces of
          data together.
        </p>
      </div>
    </>
  )
}

export default EditCuration
