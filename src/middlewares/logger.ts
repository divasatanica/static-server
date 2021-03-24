import { IContext } from '../interfaces/server';

export function Logger(logger = console) {
  return async function loggerMiddleware(ctx: IContext, next: Function) {
    const { req } = ctx;
    const { method, url } = req;
    const sign = '[static-server]'
    logger.log(sign, '>>>', new Date().toISOString(), method, url);
    await next(ctx);
    logger.log(sign, '<<<', new Date().toISOString(), method, url);
  }
}