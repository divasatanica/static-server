import * as fs from 'fs';
import * as path from 'path';
import { IContext } from '../interfaces/server';
import { render as renderTemplateWithData } from '../packages/tpl-engine/index';

export function StaticRoutes(options) {
  return async function StaticRoutesMiddleware(ctx: IContext, next: Function) {
    const { template } = options;
    const { req, serverOptions } = ctx;
    const { url } = req;
    const { assetsRoot } = serverOptions;

    if (!assetsRoot || typeof assetsRoot !== 'string') {
      throw new Error('AssetsRoot must be set');
    }
  
    const resourcePath = assetsRoot + (global.decodeURIComponent(url!) || '');
    try {
      const stat = fs.lstatSync(resourcePath);

      if (stat.isDirectory()) {
        const dir = fs.opendirSync(resourcePath);
        let files = [] as any[];
        let res;
        while (res = dir.readSync()) {
          files.push({
            path: path.join(url!, res.name),
            name: res.name
          });
        }

        ctx.body = renderTemplateWithData(template, {
          files
        });
        ctx.res.statusCode = 200;
        await next(ctx);
        return;
      }
  
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