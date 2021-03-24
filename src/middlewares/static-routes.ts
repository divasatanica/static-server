import * as fs from 'fs';
import * as path from 'path';
import { IContext } from '../interfaces/server';

const assetsRoot = path.resolve(__dirname, '../../public');

export async function StaticRoutes(ctx: IContext, next: Function) {
  const { req } = ctx;
  const { url } = req;

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
  
  const stream = fs.createReadStream(resourcePath);

  ctx.body = stream;
  await next(ctx);
}