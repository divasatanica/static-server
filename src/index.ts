import { Server } from './server';
import {
  Logger,
  StaticRoutes,
  CacheControl
} from './middlewares/index'

const Middlewares = {
  Logger,
  StaticRoutes,
  CacheControl
}

export {
  Server,
  Middlewares,
  CacheControl
}