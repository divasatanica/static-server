const { Server: StaticServer, Middlewares } = require('./dist/index');

const port = 5000
const callback = () => {
  console.log('Static Server Listening on', port);
}

const server = new StaticServer({
  port,
  listeningCallback: callback
});

server.applyMiddleware([
  Middlewares.Logger(console),
  Middlewares.CacheControl(),
  Middlewares.StaticRoutes
])

try {
  server.setup();
} catch (e) {
  console.error(e.message);
}
