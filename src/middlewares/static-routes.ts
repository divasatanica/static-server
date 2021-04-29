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
        const dirs = fs.readdirSync(resourcePath);
        let files = [] as any[];
        dirs.forEach(value => {
          files.push({
            path: path.join(url!, value),
            name: value
          });
        })
        ctx.body = renderTemplateWithData(template, {
          files,
          currentDirectory: global.decodeURIComponent(url!)
        }, {
          uglify: true
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