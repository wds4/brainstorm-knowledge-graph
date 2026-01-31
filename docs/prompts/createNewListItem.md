Create New List Item
=====

The Create New List Item page will allow the user to create a new List Item following the Decentralized Lists Custom NIP.

The page will obtain the uuid of the active List Header in the usual fashion. The top of the page will communicate to the user the name of the active list and the function of this page, which is to add an item to this list.

## Tags

### Informational tags

The user will be prompted to complete the following optional fields: `name`, `title`, `slug`, `description`, `comments` unless they are specifically listed as `disallowed` in the list header. For each such field, there will be a textarea element (in the case of description or comments) or an input element (in all other cases) for the user to input the values.

The user will be given the opportunity to create custom tags, the values of which will be assumed to be a string.

The user will also be prompted to complete the fields that are specified as either `required`, `allowed`, or `recommended` in the list header. These will be placed in the event tags of the new list item.

**### Editable**

This is a boolean yes or no. If editable, the list event will use kind 39999. If not, kind 9999. The default will be yes, editable.

### Z Tag

The Z-tag is used to reference the event of the List Header. If the List Header is kind 9998, the Z tag will be the event id of the List Header. If the List Header is kind 39998, the Z tag will be the a tag of the List Header: `39998:<pubkey of the author of the list header>:<d tag of the list header>`. This page will only support one z tag pointing to one list header at a time (even though the Decentralized Lists NIP supports multiple z tags per list item).

**### D Tag**

If the List Item is replaceable, i.e. if it used kind 39999, it must have a d tag. This field will therefore be visible only if the Editable option is selected.

The user will have two options: automatically generated d tag (default), or custom d tag. If the custom option is selected, the user can enter a string as the d tag. Spaces are not allowed. If the custom option is selected, there will be an informational box that explains:

Replaceable (addressable) events are addressed using the event kind, the author pubkey, and the d tag. You therefore must select a unique d tag; otherwise you will overwrite any prior events with matching address. They can be human readable (my-cool-da-tag) or not (e.g. the string can be a hash have the appearance of random characters.) Spaces are not allowed. 

An automatically generated d tag will be generated in the following method:

1. Concatenate the pubkey of the author and the timestamp into a string.

2. Create a hash of the concatenated string.

3. Truncate the hash so it is no longer than 16 characters. That will be the d tag.

4. It will be updated whenever there is a change to any of the editable fields. It will also be updated when the publish button is clicked.

### Control Buttons

There will be a Preview Raw Event button to toggle the visibility of the unsigned event so that the user can see it constructed in real time if desired. The default will be hidden.

There will be a Publish New List button which will be unclickable until the minimum information is specified. The absolute minimum required tags for a New List Item are the z tag, the d tag (if editable/kind 39999), and at least one additional tag. If all tags discussed in the NIP are `disallowed` by the list header, then the user will have to add at least one custom tag in order for the publish button to be active.

Publishing:

This page should publish to aDListRelays.

After publication, the page should listen for successful publication using the same method as the Create New List page. After successful publication, it should show confetti like the Create New List page and show the Success message without redirection to a new page. 

### UX

The page should be attractively put together, easy to navigate, and should have the appropriate amount of explanation.
