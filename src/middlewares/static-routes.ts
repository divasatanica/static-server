import * as fs from 'fs';
import { IContext } from '../interfaces/server';

export function StaticRoutes() {
  return async function StaticRoutesMiddleware(ctx: IContext, next: Function) {
    const { req, serverOptions } = ctx;
    const { url } = req;
    const { assetsRoot } = serverOptions;

    if (!assetsRoot || typeof assetsRoot !== 'string') {
      throw new Error('AssetsRoot must be set');
    }
  
    const resourcePath = assetsRoot + (url || '');
    try {
      const stat = fs.lstatSync(resourcePath);
  
      if (!stat.isFile()) {
        throw new Error();
      }
    } catch (e) {
      ctx.body = 'Not Found'
      ctx.res.statusCode = 404;
      await next(ctx);
      return;
    }
    
    try {
      ctx.body = fs.createReadStream(resourcePath);
    } catch (e) {
      ctx.body = JSON.stringify(e);
      ctx.res.statusCode = 404;
    } finally {
      await next(ctx);
    }
  }
}