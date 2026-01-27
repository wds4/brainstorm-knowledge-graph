import React from 'react'

// Dashboard
const App1 = React.lazy(() => import('src/views/simpleLists/index'))

// About
const About = React.lazy(() => import('src/views/simpleLists/about/index'))

// Features

const ViewLists = React.lazy(() => import('src/views/simpleLists/viewLists/index'))
const CreateList = React.lazy(() => import('src/views/simpleLists/createList/index'))
const List = React.lazy(() => import('src/views/simpleLists/list/index'))
const ViewHeader = React.lazy(() => import('src/views/simpleLists/list/viewHeader/index'))
const Items = React.lazy(() => import('src/views/simpleLists/list/items/index'))
const Item = React.lazy(() => import('src/views/simpleLists/list/items/item/index'))
const CreateItem = React.lazy(() => import('src/views/simpleLists/list/createItem/index'))
const ViewItem = React.lazy(() => import('src/views/simpleLists/list/items/item/viewItem/index'))
const EditItem = React.lazy(() => import('src/views/simpleLists/list/items/item/editItem/index'))
const ViewItemCuration = React.lazy(
  () => import('src/views/simpleLists/list/items/item/viewCuration/index'),
)
const EditHeader = React.lazy(() => import('src/views/simpleLists/list/editHeader/index'))
const Curation = React.lazy(() => import('src/views/simpleLists/list/curation/index.js'))
const ViewCuration = React.lazy(
  () => import('src/views/simpleLists/list/curation/viewCuration/index'),
)
const EditCuration = React.lazy(
  () => import('src/views/simpleLists/list/curation/editCuration/index'),
)
const ExportTL = React.lazy(
  () => import('src/views/simpleLists/list/curation/exportTrustedList/index'),
)
const ViewTL = React.lazy(
  () => import('src/views/simpleLists/list/curation/viewTrustedLists/index'),
)

const routes = [
  { path: '/simpleLists', name: 'Simple Lists', element: App1 },
  { path: '/simpleLists/about', name: 'About', element: About },
  { path: '/simpleLists/viewLists', name: 'View Lists', element: ViewLists },
  { path: '/simpleLists/createList', name: 'Create List', element: CreateList },
  { path: '/simpleLists/list', name: 'List', element: List },
  { path: '/simpleLists/list/viewHeader', name: 'List Header', element: ViewHeader },
  { path: '/simpleLists/list/items', name: 'Items', element: Items },
  { path: '/simpleLists/list/items/item', name: 'Item', element: Item },
  { path: '/simpleLists/list/createItem', name: 'Create Item', element: CreateItem },
  { path: '/simpleLists/list/items/item/viewItem', name: 'View Item', element: ViewItem },
  {
    path: '/simpleLists/list/items/item/viewCuration',
    name: 'View Curation',
    element: ViewItemCuration,
  },
  { path: '/simpleLists/list/items/item/editItem', name: 'Edit Item', element: EditItem },
  { path: '/simpleLists/list/editHeader', name: 'Edit Header', element: EditHeader },
  { path: '/simpleLists/list/curation', name: 'Curation', element: Curation },
  { path: '/simpleLists/list/curation/viewCuration', name: 'View Curation', element: ViewCuration },
  { path: '/simpleLists/list/curation/editCuration', name: 'Edit Curation', element: EditCuration },
  {
    path: '/simpleLists/list/curation/exportTrustedList',
    name: 'Export Trusted List',
    element: ExportTL,
  },
  {
    path: '/simpleLists/list/curation/viewTrustedLists',
    name: 'View Trusted Lists',
    element: ViewTL,
  },
]

export default routes
