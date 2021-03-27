import * as http from 'http';
import { IServerOptions, IMiddleWare, IContext } from './interfaces/server';
import { Middlewares } from './middleware-manager';
import { Timeout } from './middlewares/index'

class Server {
  private options: IServerOptions;
  private next: (ctx: IContext) => void;
  private middlewareMgr: Middlewares;
  constructor(options: IServerOptions) {
    this.options = options;
  }

  setup() {
    const { port, listeningCallback } = this.options;
    this.next = this.middlewareMgr.applyMiddlewares();
    http.createServer(async (_, res) => {
      const ctx = {
        res,
        req: _,
        body: {} as any,
        serverOptions: this.options
      };
      await this.next(ctx);
      if (ctx.body == null) {
        res.end('');
        return;
      }

      if (ctx.body.readable) {
        ctx.body.pipe(res);
      } else {
        res.end(ctx.body);
      }
    }).listen({
      port
    }, listeningCallback);
  }

  applyMiddleware(middlewares: IMiddleWare[]) {
    if (!this.middlewareMgr) {
      const { timeout = 3000 } = this.options
      this.middlewareMgr = new Middlewares([
        Timeout({ timeout }),
        ...middlewares
      ]);
    }
  }
}

export {
  Server
}