const path = require('path');
const { Server: StaticServer, Middlewares } = require('./dist/index');

const port = 5000
const timeout = 3000
const callback = (err) => {
  if (err) {
    console.error('Static Server Booting Error:', err);
  }
  console.log('Static Server Listening on', port);
}
const errorHandler = e => {
  console.error('[static-server] Error:', e.message);
}

const server = new StaticServer({
  port,
  assetsRoot: path.resolve(__dirname, './public')
});

server.applyMiddleware([
  Middlewares.ErrorBoundary({ errorHandler }),
  Middlewares.Timeout({ timeout }),
  Middlewares.Logger(console),
  Middlewares.AuthControl({
    whitelist: [
      '/'
    ]
  }),
  Middlewares.CacheControl(),
  Middlewares.StaticRoutes()
])

try {
  server.setup(callback);
} catch (e) {
  console.error(e.message);
}
