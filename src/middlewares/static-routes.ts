import * as fs from 'fs';
import * as path from 'path';
import { IContext } from '../interfaces/server';
import { Engine } from '../packages/tpl-engine/index';
import { getMD5 } from '../packages/utils/md5';

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
        const dirs = fs.readdirSync(resourcePath, {
          withFileTypes: true
        });
        let files = [] as any[];
        dirs.forEach(value => {
          let name = value.name;
          if (value.isDirectory()) {
            name += '/';
          }
          files.push({
            path: path.join(url!, value.name),
            name: name
          });
        })
        ctx.body = Engine.renderWithStream(template, {
          files,
          currentDirectory: global.decodeURIComponent(url!)
        }/*, {
          uglify: true
        }*/);
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

    const { res } = ctx;
    const etag = await getMD5(resourcePath);
    res.setHeader('Etag', etag);
    ctx.extendInfo.etag = etag;

    ctx.body = fs.createReadStream(resourcePath);
    await next(ctx);
  }
}