import { IContext } from '../interfaces/server';
import { uuid } from '../utils/tools'

const sign = '[static-server]';
const inSign = '>>>';
const outSign ='<<<';

export function Logger(logger = console) {
  return async function loggerMiddleware(ctx: IContext, next: Function) {
    const { req } = ctx;
    const { method, url } = req;
    const traceId = `${Date.now()}___${uuid(5)}`;
    logger.log(sign, inSign, traceId, inSign, new Date().toISOString(), method, url);
    await next(ctx);
    logger.log(sign, outSign, traceId, outSign, new Date().toISOString(), method, url);
  }
}