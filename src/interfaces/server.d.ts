import * as http from 'http';

export interface IServerOptions {
  port: number;
  assetsRoot: string;
  listeningCallback?: () => void;
}

export interface IMiddleWare {
  (ctx: IContext, next?: IMiddleWare): any;
}

export interface IContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  serverOptions: IServerOptions;
  body?: any;
}