const { Server } = require('./dist/index');

const port = 3000
const callback = () => {
  console.log('Static Server Listening on', port);
}

const server = new Server({
  port,
  listeningCallback: callback
});