Brainstorm Knowledge Graph
=====

Forked from [Nostr-React-Dashboard Template](https://github.com/PrettyGoodFreedomTech/nostr-react-dashboard-template)

## issues inherited from Nostr-React-Dashboard Template

1. nostr-hooks v2.9.11 has problems with persistence of login using secret keys. It seems to forget it was logged in when refreshing the page. Maybe I need to switch back from `useAutoLogin` back to `(reL)(l)oginFromLocalStorage`? nostr-hooks v2.8.4 does not have this persistence of data problem, but does not have useProfile which is in v2.9.11

2. Remote signer login has not yet been tested.

3. Secret Key login gives incorrect error messages and currently only supports nsec. Plan to support hex.

4. useProfile (Hello World page 3) seems to create persistent rerenders and I don't know why. For now, my customized `asyncFetchProfile` which uses ndk (Hello World page 4) seems to work better.

5. still not decided whether to use `useAutoLogin` or `(reL)(l)oginFromLocalStorage` or what the difference is

6. Have not decided whether to store logged-in user data at the point of login for a better UX, i.e. to prevent avatar image from flickering whenever you change pages. 

7. read / write from individual relays

## Quick Start

- Clone the repo: `git clone https://github.com/wds4/brainstorm-knowledge-graph.git`
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

