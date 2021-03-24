import * as http from 'http';
import { IServerOptions, IMiddleWare } from './interfaces/server';

class Server {
  constructor(options: IServerOptions) {
    this.setup(options);
  }

  private setup(options: IServerOptions) {
    const { port, listeningCallback } = options;
    http.createServer(async (_, res) => {
      res.end('Hello world');
      const ctx = {
        res,
        req: _
      }

      
    }).listen({
      port
    }, listeningCallback);
  }

  use(middleware: IMiddleWare) {
    console.log(middleware);
  }
}

export {
  Server
}