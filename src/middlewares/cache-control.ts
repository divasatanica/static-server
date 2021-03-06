import * as path from 'path';
import { IContext } from '../interfaces/server';
import { checkMimeTypes } from '../utils/mime-type';
import { LRUCache } from '../packages/utils/lru-cache';

const DefaultMaxAges = {
  'text/html': 60,
  'image/*': 10,
  'application/javascript': 3600
};

const CacheControlHeaderName = 'Cache-Control';

export function CacheControl(config = DefaultMaxAges) {
  const lruCache = new LRUCache(100);
  const countLruCache = new LRUCache(100);
  return async function CacheControlMiddleware(ctx: IContext, next: Function) {
    const { res, req } = ctx;
    const { url } = req;
    const extname = path.extname(url!);
    const mimeTypes = checkMimeTypes(extname);

    const etag = req.headers['if-none-match'];
    if (etag === lruCache.get(url!)) {
      // Update the etag once per 10 access times
      if (countLruCache.get(url!) < 10) {
        const count = countLruCache.get(url!);
        countLruCache.put(url!, count + 1);
        res.statusCode = 304;
        ctx.body = '';
        return;
      }
      
    }

    if (!mimeTypes) {
      await next(ctx);
      return;
    }

    const cacheControlHeader = config[mimeTypes];

    if (typeof cacheControlHeader === 'number') {
      res.setHeader(CacheControlHeaderName, `max-age=${cacheControlHeader}`);
    } else if (typeof cacheControlHeader === 'string') {
      res.setHeader(CacheControlHeaderName, cacheControlHeader);
    }
    countLruCache.put(url!, 0);
    await next(ctx);
    lruCache.put(url!, ctx.extendInfo.etag)
  }
}