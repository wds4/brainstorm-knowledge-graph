Single List Item Curation Details
=====

This document describes the appearance and function of the View Curation of Single List Item page, located at:

src/views/simpleLists/list/items/item/viewCuration/viewCuration.js

This page will take as input the event, uuid, and uuidType of a single list item and will return every [NIP-25, kind 7 reaction](https://github.com/nostr-protocol/nips/blob/master/25.md) to this event that can be found in aDListRelays. 

If uuidType == “aTag”, we will use the following filter:

```jsx
{
	"kinds": [7],
	"#a":["<uuid>"]
}
```

If the uuidType == “eventId”, we will use the following filter:

```jsx
{
	"kinds": [7],
	"#e": ["<uuid>"]
}
```

If the uuidType is neither aTag nor eventId, we will display an error message that we are unable to search for reactions to this list item due to unrecognized uuid type.

We will interpret kind 7 reactions with content field “+” or “-” as upvotes or downvotes, respectively. If the content field is not one of these two options, that kind 7 reaction will be considered invalid and ignored.

For each valid reaction, we will obtain the Trust Score of the author of the reaction. We will also obtain the Trust Score of the author of the list item, which we will obtain from the event that is passed in to this page. 

To obtain Trust Scores, we will first look in the rank_score_lookup variable in SessionStorage. If a valid (integer) score is not available, we will look try to obtain the kind 30382 Trusted Assertion of the author. Please see the prompt at docs/prompts/trustedAssertions.md for details on how to do this. The fallback score will be 0. Make sure that whenever a Trusted Assertion event with a valid result is found, that rank_score_lookup is updated with the appropriate data for that pubkey.

### Display

There will be a table that will show each reaction in a single row. The table will have these columns: author of the reaction, the author’s Trust Score, how long ago the reaction was issued, and Reaction which shows a thumbs up or down emoji based on whether the reaction is an upvote or a downvote. Rows where the Trust Score is below the cutoff score should be visually differentiated from the rest, so users can see easily that that row is not counted in the final calculation. 

The top row of the table will be the author of the list item. This row will have a different visual appearance to the rest of the rows. In the Reaction column, there will be the word “author” in place of the thumbs up or down emoji. The reaction rows will be sorted from most recent on top to oldest on the bottom.

### Final score calculation:

The final score for the list item will be tabulated as follows.

We will obtain the trustScoreCutoff from SessionStorage. If unavailable, use the default value from src/views/settings/parameters/default.json

Baseline score: 0

If the author’s score is greater than or equal to trustScoreCutoff, increment the score by 1.

For each kind 7 upvote, if the author’s score is greater than or equal to trustScoreCutoff, increment the score by 1.

For each kind 7 downvote, if the author’s score is greater than or equal to trustScoreCutoff, decrement the score by 1.

### Presentation of the final score

The final score of the list item will be displayed in a panel prominently at the top of the page, below the title but above the table. This panel will include summary of valid votes (e.g., "3 upvotes, 1 downvote from trusted users"). We will also display the trustScoreCutoff. In this fashion,  the user will have enough information to verify proper calculation of the item’s final score.
