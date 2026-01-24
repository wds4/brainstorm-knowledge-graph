import routesMain from './routes/routesMain'
import routesProfile from './routes/routesProfile'
import routesHelloWorld from 'src/routes/routesHelloWorld'
import routesSettings from 'src/routes/routesSettings'
import routesApp1 from 'src/routes/routesApp1'
import routesApp2 from 'src/routes/routesApp2'
import routesApp3 from 'src/routes/routesApp3'

const routes = [
  ...routesMain,
  ...routesProfile,
  ...routesHelloWorld,
  ...routesSettings,
  ...routesApp1,
  ...routesApp2,
  ...routesApp3,
]

export default routes
