Trusted Assertions
=====
NIP-85
-----

We will use [NIP-85: Trusted Assertions](https://nostrhub.io/naddr1qvzqqqrcvypzq3svyhng9ld8sv44950j957j9vchdktj7cxumsep9mvvjthc2pjuqy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqyn5wf6hxar9vskkzumnv4e8g6t0deesu5l7ne) to keep track of Trust Metrics of nostr users.

As per Trusted Assertions NIP, we will use SessionStorage to track the kind 10040 event of the logged-in user. To find the 10040 event, we will look inside aPopularGeneralPurposeRelays. The trust metric we are interested in is the rank metric. From the 10040 event, from the 30382:rank tag, we will extract the rank_trusted_service_provider_pubkey and the rank_nip85_relay variables. Each of these two variables will be stored in SessionStorage. If the relay is missing from the kind 10040 event or is invalid, store rank_nip85_relay in SessionStorage as null. We will NOT store the entire kind 10040 event in SessionStorage; only the data extracted as just described.

When we need to fetch the rank score of a user whose pubkey is <pubkey>, we will obtain the kind 30382 Trusted Assertion from rank_nip85_relay using the following filter:

```jsx
{
"kinds": [30382],
"authors": ["<rank_trusted_service_provider_pubkey>"],
"#d":["<pubkey>"]
}
```

If the event cannot be found from rank_nip85_relay, we will NOT try to obtain Trusted Assertion events from any fallback relays. If rank_nip85_relay is null or unknown, we will assume that no Trusted Assertion events are available.

From the kind 30382 event, we will extract the rank of <pubkey>, which will be an integer between 0 and 100. This may or may not be stringified. If so, we will convert it to integer format. An absent Trusted Assertion event will be recorded as null. A rank tag where the scores is null or formatted incorrectly (neither a string nor an integer, and not between 0 and 100 once converted to integer format) will be recorded as null. 

This score will be stored in SessionStorage in a variable called rank_score_lookup, which is a stringified object formatted like this:

```jsx
{
	"pk_active": "<pubkey of the active user>",
	"lastReset": <timestamp>, // UNIX milliseconds, Date.now()
	"rank": {
		"<pubkey1>": <rank1>,
		"<pubkey2>": <rank2>,
		"<pubkey3>": <rank3>,
		...
	}
}
```

Upon logout, rank_score_lookup will be reset to:

```jsx
{
	"pk_active": null,
	"lastReset": <timestamp>,
	"rank": {}
}
```

When rank_score_lookup is initialized or reset by the logged in user, it is reset to this:

```jsx
{
	"pk_active": "<pk_active>",
	"lastReset": <timestamp>,
	"rank": {
		"<pk_active>": 100
	}
}
```

The “lastReset” timestamp will help us to debug if rank_score_lookup is getting reset too frequently, for whatever reason.

Whenever we need to obtain a user’s rank score, the first place we will check is SessionStorage. Will will make sure <pk_active> is correct; if not, we will reset rank_score_lookup. If we cannot find it, we will look for the user’s kind 30382 Trusted Assertion. 

One last thing: the rank score of the logged in user is always 100 by default, regardless of any other data that may or may not be available. We will not override the score of 100 even if there is a Trusted Assertion event to the contrary.

Upon logout, **rank_trusted_service_provider_pubkey and rank_nip85_relay** will be wiped by setting them to null. rank_score_lookup will be reset as described above.

### Trusted Assertions Settings page

The Trusted Assertions Settings page will show the following pieces of information:

1. active user pubkey
2. The active user’s 10040 event with these properties: content, tags, created_at, id, sig, pubkey, kind, which we will redownload when the user navigates to the Settings page. (The user will have the ability to toggle show versus hidden, with default hidden, the raw JSON in <pre> element with a maximum height of 400 px and style settings to overflow: scroll), if available.
3. rank_trusted_service_provider_pubkey
4. rank_nip85_relay
5. How long ago rank_score_lookup was reset.
6. Number of rank scores currently available in rank_score_lookup.
7. rank_score_lookup (raw JSON)

There will be several buttons on this page, all of which will be greyed out and inactive if the user is not logged in.

**Reset Trusted Assertion Settings** that will reset rank_score_lookup.

**Reset 10040:** this will set rank_trusted_service_provider_pubkey and rank_nip85_relay to null

Download 10040: this will look up the active user’s kind 10040 event and populate rank_trusted_service_provider_pubkey and rank_nip85_relay

### Clarifications:

We will support encrypted Trusted Assertion events, as per the NIP.

If there are multiple 30382:rank entries, we will use the first.

All of the SessionStorage variable names described in this document will be consistent across this app.

If description of an encrypted kind 30382 event fails, we will show an error on the Settings page that decryption of one or more Trusted Assertion events failed. Whatever data we were hoping to extract, but could not due to failed encryption, will be treated as if it could not be found.
