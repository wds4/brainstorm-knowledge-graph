import React from 'react'

// Dashboard
const Concepts = React.lazy(() => import('src/views/concepts/index'))

// About
const About = React.lazy(() => import('src/views/concepts/about/index'))

// Features

const ViewConcepts = React.lazy(() => import('src/views/concepts/viewConcepts/index'))
const CreateConcept = React.lazy(() => import('src/views/concepts/createConcept/index'))
const Concept = React.lazy(() => import('src/views/concepts/concept/index'))
const ViewConcept = React.lazy(() => import('src/views/concepts/concept/viewConcept/index'))
const Elements = React.lazy(() => import('src/views/concepts/concept/elements/index'))
const Element = React.lazy(() => import('src/views/concepts/concept/elements/element/index'))
const CreateElement = React.lazy(() => import('src/views/concepts/concept/createElement/index'))
const ViewElement = React.lazy(
  () => import('src/views/concepts/concept/elements/element/viewElement/index'),
)
const EditElement = React.lazy(
  () => import('src/views/concepts/concept/elements/element/editElement/index'),
)
const ViewElementCuration = React.lazy(
  () => import('src/views/concepts/concept/elements/element/viewCuration/index'),
)
const EditConcept = React.lazy(() => import('src/views/concepts/concept/editConcept/index'))
/*
const Curation = React.lazy(() => import('src/views/concepts/concept/curation/index.js'))
const ViewCuration = React.lazy(
  () => import('src/views/concepts/concept/curation/viewCuration/index'),
)
const EditCuration = React.lazy(
  () => import('src/views/concepts/concept/curation/editCuration/index'),
)
const ExportTL = React.lazy(
  () => import('src/views/concepts/concept/curation/exportTrustedConcept/index'),
)
const ViewTL = React.lazy(
  () => import('src/views/concepts/concept/curation/viewTrustedConcepts/index'),
)
*/
const routes = [
  { path: '/concepts', name: 'Concepts', element: Concepts },
  { path: '/concepts/about', name: 'About', element: About },
  { path: '/concepts/viewConcepts', name: 'View Concepts', element: ViewConcepts },
  { path: '/concepts/createConcept', name: 'Create Concept', element: CreateConcept },
  { path: '/concepts/concept', name: 'Concept', element: Concept },
  { path: '/concepts/concept/viewConcept', name: 'Concept Concept', element: ViewConcept },
  { path: '/concepts/concept/elements', name: 'Elements', element: Elements },
  { path: '/concepts/concept/elements/element', name: 'Element', element: Element },
  { path: '/concepts/concept/createElement', name: 'Create Element', element: CreateElement },
  {
    path: '/concepts/concept/elements/element/viewElement',
    name: 'View Element',
    element: ViewElement,
  },
  {
    path: '/concepts/concept/elements/element/viewCuration',
    name: 'View Curation',
    element: ViewElementCuration,
  },
  {
    path: '/concepts/concept/elements/element/editElement',
    name: 'Edit Element',
    element: EditElement,
  },
  { path: '/concepts/concept/editConcept', name: 'Edit Concept', element: EditConcept },
  /*
  { path: '/concepts/concept/curation', name: 'Curation', element: Curation },
  { path: '/concepts/concept/curation/viewCuration', name: 'View Curation', element: ViewCuration },
  { path: '/concepts/concept/curation/editCuration', name: 'Edit Curation', element: EditCuration },
  {
    path: '/concepts/concept/curation/exportTrustedConcept',
    name: 'Export Trusted Concept',
    element: ExportTL,
  },
  {
    path: '/concepts/concept/curation/viewTrustedConcepts',
    name: 'View Trusted Concepts',
    element: ViewTL,
  },
  */
]

export default routes
