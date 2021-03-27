import * as fs from 'fs';
import * as path from 'path';
import { IContext } from '../interfaces/server';
import { checkMimeTypes } from '../utils/mime-type';

const assetsRoot = path.resolve(__dirname, '../../public');
const asyncReadFile = (path: string) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      reject(err);
    }

    resolve(data);
  })
})

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
  
  try {
    if (checkMimeTypes(path.extname(url!)) === 'text/html') {
      ctx.body = fs.createReadStream(resourcePath);
    } else {
      const data = await asyncReadFile(resourcePath);
      ctx.body = data;
    }
  } catch (e) {
    ctx.body = JSON.stringify(e);
    ctx.res.statusCode = 404;
  } finally {
    await next(ctx);
  }
  
}