import React from 'react'

// Dashboard
const App1 = React.lazy(() => import('src/views/app1/index'))

// About
const About = React.lazy(() => import('src/views/app1/about/index'))

// Features

const ViewLists = React.lazy(() => import('src/views/app1/viewLists/index'))
const CreateList = React.lazy(() => import('src/views/app1/createList/index'))
const List = React.lazy(() => import('src/views/app1/list/index'))
const ViewHeader = React.lazy(() => import('src/views/app1/list/viewHeader/index'))
const Items = React.lazy(() => import('src/views/app1/list/items/index'))
const Item = React.lazy(() => import('src/views/app1/list/items/item/index'))
const CreateItem = React.lazy(() => import('src/views/app1/list/createItem/index'))
const ViewItem = React.lazy(() => import('src/views/app1/list/items/item/viewItem/index'))
const EditItem = React.lazy(() => import('src/views/app1/list/items/item/editItem/index'))
const EditHeader = React.lazy(() => import('src/views/app1/list/editHeader/index'))
const Curation = React.lazy(() => import('src/views/app1/list/curation/index'))
const ViewCuration = React.lazy(() => import('src/views/app1/list/curation/viewCuration/index'))
const EditCuration = React.lazy(() => import('src/views/app1/list/curation/editCuration/index'))
const ExportTL = React.lazy(() => import('src/views/app1/list/curation/exportTrustedList/index'))
const ViewTL = React.lazy(() => import('src/views/app1/list/curation/viewTrustedLists/index'))

const routes = [
  { path: '/app1', name: 'Simple Lists', element: App1 },
  { path: '/app1/about', name: 'About', element: About },
  { path: '/app1/viewLists', name: 'View Lists', element: ViewLists },
  { path: '/app1/createList', name: 'Create List', element: CreateList },
  { path: '/app1/list', name: 'List', element: List },
  { path: '/app1/list/viewHeader', name: 'List Header', element: ViewHeader },
  { path: '/app1/list/items', name: 'Items', element: Items },
  { path: '/app1/list/items/item', name: 'Item', element: Item },
  { path: '/app1/list/createItem', name: 'Create Item', element: CreateItem },
  { path: '/app1/list/items/item/viewItem', name: 'View Item', element: ViewItem },
  { path: '/app1/list/items/item/editItem', name: 'Edit Item', element: EditItem },
  { path: '/app1/list/editHeader', name: 'Edit Header', element: EditHeader },
  { path: '/app1/list/curation', name: 'Curation', element: Curation },
  { path: '/app1/list/curation/viewCuration', name: 'View Curation', element: ViewCuration },
  { path: '/app1/list/curation/editCuration', name: 'Edit Curation', element: EditCuration },
  { path: '/app1/list/curation/exportTrustedList', name: 'Export Trusted List', element: ExportTL },
  { path: '/app1/list/curation/viewTrustedLists', name: 'View Trusted Lists', element: ViewTL },
]

export default routes
