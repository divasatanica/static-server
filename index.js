const { Server: StaticServer, Middlewares } = require('./dist/index');

const port = 3000
const callback = () => {
  console.log('Static Server Listening on', port);
}

const server = new StaticServer({
  port,
  listeningCallback: callback
});

server.applyMiddleware([
  Middlewares.Logger(console),
  Middlewares.StaticRoutes
])

try {
  server.setup();
} catch (e) {
  console.error(e.message);
}
