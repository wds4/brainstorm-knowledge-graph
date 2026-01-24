the Pretty Good Freedom Technology NRD Template
=====
NRD: nostr + react + dashboard
-----

The is a free template for anyone who wants to make a nostr app in react using a dashboard (admin) - style UI. It relies on the open source [nostr-hooks](https://github.com/ostyjs/nostr-hooks) by osty, as well as ndk and nostr-tools.



## How this template was created

This repo was created using the following steps:

1. Fork of [CoreUI Free React.js Admin Template](https://github.com/coreui/coreui-free-react-admin-template)
2. Navigation reformatted, extraneous pages removed, to create [this template](https://github.com/PrettyGoodFreedomTech/coreui-admin-stripped)
3. Nostr functionality added, as described below

## nostr

```
npm install @nostr-dev-kit/ndk
npm install @nostr-dev-kit/ndk-cache-dexie
npm install @noble/hashes
npm install nostr-tools
npm install nostr-hooks@2.8.4
```

- added `src/helpers/nip19.js`
- added `src/helpers/relays.js`
- added `src/helpers/ndk.js` with the function `asyncFetchProfile` (see below)
- enabled nostr login
- added `src/const` folder
- Persistence of login: currently using either `useAutoLogin` or `(reL)(l)oginFromLocalStorage` in `App.js`, without which `activeUser` is null 
- profile page will download user information when ?npub or ?pubkey is included in the url
- "Hello World" pages to demonstrate usage of:
    - useSubscribe
    - useActiveUser
    - useProfile
    - useNdk
    - useNewEvent, useSigner

Data persistence: So far, I am not making use of ndk's caching adapters (ndk-cache-redis or ndk-cache-dexie) and have not used redux, although it should be noted that redux is utilized by the underyling CoreUI template. I'm probably going to avoid any specialized caching for the sake of the NRD template.

Hello World test page 1 illustrates one of the pitfalls of using react and nostr at the same time: rerenders. See comments in the relevant script.

## current issues & work to be done

1. nostr-hooks v2.9.11 has problems with persistence of login using secret keys. It seems to forget it was logged in when refreshing the page. Maybe I need to switch back from `useAutoLogin` back to `(reL)(l)oginFromLocalStorage`? nostr-hooks v2.8.4 does not have this persistence of data problem, but does not have useProfile which is in v2.9.11

2. Remote signer login has not yet been tested.

3. Secret Key login gives incorrect error messages and currently only supports nsec. Plan to support hex.

4. useProfile (Hello World page 3) seems to create persistent rerenders and I don't know why. For now, my customized `asyncFetchProfile` which uses ndk (Hello World page 4) seems to work better.

5. still not decided whether to use `useAutoLogin` or `(reL)(l)oginFromLocalStorage` or what the difference is

6. Have not decided whether to store logged-in user data at the point of login for a better UX, i.e. to prevent avatar image from flickering whenever you change pages. 

7. read / write from individual relays

## Quick Start

- Clone the repo: `git clone https://github.com/PrettyGoodFreedomTech/grapevine-brainstorm.git`
- cd into the folder you just created

### Installation

``` bash
$ npm install
```

or

``` bash
$ yarn install
```

### Basic usage

``` bash
# dev server with hot reload at http://localhost:3000
$ npm start 
```

or 

``` bash
# dev server with hot reload at http://localhost:3000
$ yarn start
```

Navigate to [http://localhost:3000](http://localhost:3000). The app will automatically reload if you change any of the source files.

#### Build

Run `build` to build the project. The build artifacts will be stored in the `build/` directory.

```bash
# build for production with minification
$ npm run build
```

or

```bash
# build for production with minification
$ yarn build
```

