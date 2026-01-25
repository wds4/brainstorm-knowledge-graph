Settings
=====

This page presents the various editable parameters that the Brainstorm Knowledge Graph end user will manage. 

## Functionality

Brainstorm Knowledge Graph is a webapp. Editable parameters are key-value pairs and will be stored in the browser using SessionStorage.

Each editable parameter will have a hardcoded *default* value as well as an *active* value. The default values will be stored in `src/views/settings/parameters/defaults.json`. (The default values in this prompt document may be stale. When conflict arises, stick with the values in the repository in the defaults.json codebase.) The active values will be stored in SessionStorage. There will be a function called initializeAllParameters that initializes all active values in SessionStorage to their hardcoded defaults. This function will be called whenever the user logs in to the webapp. It will also be called when triggered by the relevant button on the Settings page. 

For each editable parameter, the user can:

- update the active value manually
- click a button to restore an individual active value to its hardcoded default value

There will also be one button that the end user can use to re-trigger the initializeAllParameters function to reset *all* parameters to their hardcoded default values.

## Editable Parameters

There will be approximately 21 editable parameters:

- the Cypher Query Endpoint (one parameter), in the Miscellaneous Parameters table.
- Concept UUIDs (approximately 7 parameters) in the Canonical Knowledge Graph Node Types table
- Relationship Type UUIDs (approximately 6 parameters) in the Relationship types table
- Relay Arrays (approximately 7 parameters, each a stringified array) in the Relays Table

### User Interface

The settings page of the app will display all of the information in the below tables, with no change to any of the rows or the columns with the exception of the active UUID columns which will populate with the active values in SessionStorage. The first column will be the parameter keys, the second to last column will be the default values, the last column with be the active values, and the columns in between will be informational only, to help the user understand the meaning of each parameter. 

Each of the approximately 21 parameters will be associated with an edit button, which will toggle the corresponding Active Value cell to enable the user to enter the new value, and a restore button, which will update the active value in SessionStorage with the hardcoded default value. When in editing mode, there will be a save or update button which will update the new active value in SessionStorage. The active value column should reflect what’s in SessionStorage. In the Relay Arrays, table, each Active Relays parameter is an array, stringified in SessionStorage. We should make sure the display and edit modes for this table are designed with good UX in mind.

### Table: Miscellaneous Parameters

| **Slug** | **Name** | **Default Value** | **Active Value** |
| --- | --- | --- | --- |
| `neo4jCypherQueryUrl` | Neo4j Database Cypher Query URL Endpoint | “https://straycat.brainstorm.social/api/knowledge-graph-query” |  |

### Table: “Canonical” Knowledge Graph Concept UUIDs

There are 7 *Concept UUID* parameters, each of which is a string in one of 3 formats: a nostr event id, an aTag, or an naddr.

The key for each parameter is the first column in the table, the slug for the Concept. The default value is the last column in the table, the default uuid.

| **Slug** | **List Header (Name of the Concept)** | **Neo4j Node Label** | **Default UUID** | **Active UUID** |
| --- | --- | --- | --- | --- |
| relationship | relationships | Relationship | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:c15357e6-6665-45cc-8ea5-0320b8026f05 |  |
| relationshipType | relationship types | RelationshipType | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:826fa669-b494-46bd-9326-97b894c70d8b |  |
| nodeType | node types | NodeType | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:1276c2c4-8efb-41b1-ae88-11ca61b4e572 |  |
| set | sets | Set | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:6a339361-beef-4013-a916-1723e05a4671 |  |
| superset | supersets | Superset | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:21cbf5be-c972-4f45-ae09-c57e165e8cf9 |  |
| JSONSchema | JSON schemas | JSONSchema | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:bba896cc-c190-4e26-a26f-66d678d4ac89 |  |
| property | properties | Property | 39998:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:6c6a1f9e-6afc-4283-9798-cd2f68c522a7 |  |

### Table: Relationship Type UUIDs

There are 6 *Relationship Type UUID* parameters, each of which is a string in one of 3 formats: a nostr event id, an aTag, or an naddr.

The key for each parameter is the first column in the table, the slug for the Relationship Type.

| **Slug** | **Alias** | **Default UUID** | **Active UUID** |
| --- | --- | --- | --- |
| CLASS_THREAD_INITIATION | IS_THE_CONCEPT_FOR | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:24bc3eb6-fd75-4679-a3d7-d0b1a2a62be8 |  |
| CLASS_THREAD_PROPAGATION | IS_A_SUPERSET_OF | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:e65edc7b-5f33-436a-a7b5-c8092da85d18 |  |
| CLASS_THREAD_TERMINATION | HAS_ELEMENT | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:cad330c4-be50-4fa0-8178-0982078b908a |  |
| IS_A_PROPERTY_OF |  | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:9a74ffbd-33c6-456a-a5a9-9711d504e81d |  |
| IS_THE_JSON_SCHEMA_FOR |  | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:86ac71be-eab8-4b15-bb17-313b8378d2e5 |  |
| ENUMERATES |  | 39999:e5272de914bd301755c439b88e6959a43c9d2664831f093c51e9c799a16a102f:d0b4f08e-df4a-4131-a75c-e5bd056e4d78 |  |

### Table: Relay Arrays

There are approximately 7 “relay array” parameters. Each parameter is an array of strings. The default values are stored in JSON. The active values are stringified and stored in SessionStorage. The Active Relays column of this table should indicate the current active value that is stored in SessionStorage. When the user edits one of the active values, the input field should be formatted as JSON for a better UX.

The name of the parameter is the first column in the table, the relay array name.

| **Slug** | **Supported Event Kinds** | **Default Relays** | **Active Relays** |
| --- | --- | --- | --- |
| aPopularGeneralPurposeRelays |  | ["wss://relay.damus.io", "wss://relay.primal.net", "wss://nos.lol", "wss://relay.nostr.band”] |  |
| aDListRelays | 9998,9999,39998,39999 | [”`wss://dcosl.brainstorm.wordl`"] |  |
| aTrustedAssertionRelays | 3038x | [”`wss://nip85.nostr.band`", “`wss://nip85.brainstorm.world`", “`wss://nip85.nostr1.com`"] |  |
| aTrustedListRelays | 3039x | [”`wss://nip85.brainstorm.world`"] |  |
| aWotRelays | 3, 1984, 10000 | [”wss://wot.grapevine.network”] |  |
| aProfileRelays | 0 | [”wss://purplepag.es”, “[profiles.nostr1.com](http://profiles.nostr1.com/)”] |  |
| aOutboxRelays |  | [] |  |

Clicking on the relay array name (left column) will toggle a “relay information box” (element id: relayInformationBox) below the table to explain what each of these sets of arrays is for. This element will be initialized to inform the user to click on the relay array name for information. When clicked, this is the information that will be shown in the relay information box:

aPopularGeneralPurposeRelays: As the name implies. We will look for 10040 events here (among other places). We may also use these to look for curation-related events like kind 7 reactions.

aDListRelays: These relays support the [DLists Custom Nip](https://nostrhub.io/naddr1qvzqqqrcvypzpef89h53f0fsza2ugwdc3e54nfpun5nxfqclpy79r6w8nxsk5yp0qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqymyv43k2mn5wfskc6t6v4jz6mrfwd68xnwasck). These relays will accept kinds 9998, 9999, 39998, 39999 events. They may also accept kinds 7 events and any other events that may gain usage for curation of DLists.

aTrustedAssertionRelays: These relays support the [Trusted Assertion Custom NIP](https://nostrhub.io/naddr1qvzqqqrcvypzpef89h53f0fsza2ugwdc3e54nfpun5nxfqclpy79r6w8nxsk5yp0qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqrt5wf6hxar9vskkc6tnw3es3qz3t6). They should accept kinds 3038x events as per the NIP. 

aTrustedListRelays: These relays support the [Trusted List Custom NIP](https://nostrhub.io/naddr1qvzqqqrcvypzpef89h53f0fsza2ugwdc3e54nfpun5nxfqclpy79r6w8nxsk5yp0qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqrt5wf6hxar9vskkc6tnw3es3qz3t6). They should accept kinds 3039x events as per the NIP.

aWotRelays: These relays support calculation of GrapeRank by Brainstorm instances.

aProfileRelays: These are relays known to support kind 0 events (not including general purpose relays). Brainstorm: Knowledge Graph may use other relays, such as aPopularGeneralPurposeRelays or aOutboxRelays, in addition to aProfileRelays to look for kind 0 events.

aOutboxRelays: These support the Outbox model. Kind 10040 events will be published to aPopularGeneralPurposeRelays as well as the user’s aOutboxRelays.
