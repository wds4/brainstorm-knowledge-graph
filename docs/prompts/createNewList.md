Create New List
=====

The Create New List page will allow the user to create a new List Header following the Decentralized Lists Custom NIP.

The user will be prompted to complete the following fields:

### Name for one list item (singular)

The name (singular) field is a text field. It is required to publish a new list.

### Name for multiple list items (plural)

The name (plural) field is a text field. It is required.

### Description

The description field is a text field. It is optional. 

### Editable

This is a boolean yes or no. If editable, the list event will use kind 39998. If not, kind 9998. The default will be yes, editable.

### D Tag

If the List Header is replaceable, i.e. if it used kind 39998, it must have a d tag. This field will therefore be visible only if the Editable option is selected. 

The user will have two options: automatically generated d tag (default), or custom d tag. If the custom option is selected, the user can enter a string as the d tag. Spaces are not allowed. If the custom option is selected, there will be an informational box that explains:

Replaceable (addressable) events are addressed using the event kind, the author pubkey, and the d tag. You therefore must select a unique d tag; otherwise you will overwrite any prior events with matching address. They can be human readable (my-cool-da-tag) or not (e.g. the string can be a hash have the appearance of random characters.) Spaces are not allowed. 

An automatically generated d tag will be generated in the following method:

1. concatenate the three text entry fields (name singular, name plural, description) with the timestamp.
2. Create a signature of the concatenated string using the logged-in user.
3. Truncate the signature so it is no longer than 16 characters. that will be the d tag.
4. It will be updated whenever there is a change to any one of the three text fields.

### Basic Informational Tags

There will be between one and two basic informational tags: 

The names tag will have three string elements: “names”, the singular name field, and the plural name field.

Optionally, there will be a description tag with two string elements: “description” and the description as entered by the user. If the user enters no description, the description tag will be omitted.

### Constraint Tags

Constraint tags are used to indicate what information is and is not expected to be found in list item events. The user will add constraint tags to the event tags field one at a time by clicking the `add tag` button. It is not necessary to add any tags, but the user can add as many as desired. 

Each constaint tag will have two strings: constraintType and listItemTagName

For each new tag, there will be two selectors. 

The first selector will determine the constraintType and have these options: required, optional, allowed, recommended, disallowed.

The second selector will determine the listItemTagName. The user will see these options: custom, p (pubkey), e (event id), a (aTag or naddr), t (text/hashtag). If custom is selected (which will be the default), the user will see a field with `custom tag name` as the placeholder. If any of the other 4 options is selected, the listItemTagName will be single character, either p, e, a, or t.

There will be a preview of the constraint tags localted below the add tag button.

### Control Buttons

There will be a Preview Raw Event button to toggle the visibility of the unsigned event so that the user can see it constructed in real time if desired. The default will be hidden.

There will be a Publish New List button which will be unclickable until the minimum information is specified: name (singular), name (plural), and d-tag if custom option is selected.

### UX

The page should be attractively put together, easy to navigate, and should have the appropriate amount of explanation.
