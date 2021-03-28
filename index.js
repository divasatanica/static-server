const path = require('path');
const { Server: StaticServer, Middlewares } = require('./dist/index');

const port = 5000
const callback = () => {
  console.log('Static Server Listening on', port);
}
const errorHandler = e => {
  console.error('[static-server] Error:', e.message);
}

const server = new StaticServer({
  port,
  listeningCallback: callback,
  errorHandler
});

server.applyMiddleware([
  Middlewares.Logger(console),
  Middlewares.CacheControl(),
  Middlewares.StaticRoutes({
    assetsRoot: path.resolve(__dirname, './public')
  })
])

try {
  server.setup();
} catch (e) {
  console.error(e.message);
}
