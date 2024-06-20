import type { Plugin } from 'vite';
import type { http1WebOptions, wsHttp1Options } from 'http2-proxy';
import * as Http2 from 'http2';
const devcert = require("devcert");

const http2Proxy = require("http2-proxy");

type OptionsTypes = {
    proxy?: { [key: string]: http1WebOptions & { ws?: boolean; } } ,
    certificateDomain?: string,
    ssl?: {
        key: string;
        cert: string;
    }
    timeout?: number;
}

export default (options?: OptionsTypes): Plugin => {
    return {
        name: 'vite-plugin-http2-ws',
        config: async (_, env) => {
            if (env.command !== 'serve') {
                return;
            }
            if (options?.ssl) {
                return {
                    server: {
                        https: {
                            key: options.ssl.key,
                            cert: options.ssl.cert,
                        }
                    }
                }
            }
            let ssl: Awaited<ReturnType<typeof devcert.certificateFor>>;
            // 生成证书必须包含 localhost 所以做一下处理

            try {
                ssl = await devcert.certificateFor(options?.certificateDomain || 'localhost');
            } catch (err) {
                console.error('vite-plugin-http2-ws', err);
            }
            if (ssl && ssl.cert.toString() && ssl.key.toString()) {
                return {
                    server: {
                        https: {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            key: ssl.key,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            cert: ssl.cert,
                        }
                    }
                };
            }
            console.warn('[vite-plugin-http2-ws]: sorry, devcert create certificate fail, you can pass ssl option to create http2 server');
            return {};
        },
        configureServer: async (server) => {
            if (options?.proxy) {
                server.middlewares.use((req, res, next) => {
                    // 如果有一个配置命中请求，进行转发处理
                    for (const [regexp, proxyOptions] of Object.entries(options.proxy!)) {
                        const re = new RegExp(regexp);
                        if (req.url && re.test(req.url)) {
                            http2Proxy.web(
                                req as unknown as Http2.Http2ServerRequest,
                                res as unknown as Http2.Http2ServerResponse,
                                {...proxyOptions, ws: undefined, proxyTimeout: options?.timeout} as http1WebOptions,
                                (err?: Error) => err && next(err)
                            );
                            return;
                        }
                    }
                    // 当没有命中代理的时候，直接丢到下一个中间件
                    next();
                });
                server.httpServer?.on('upgrade', (req, socket, head) => {
                    // 如果有一个配置命中请求，进行转发处理
                    for (const [regexp, proxyOptions] of Object.entries(options.proxy!)) {
                      const re = new RegExp(regexp);
                      if (req.url && re.test(req.url) && proxyOptions?.ws ){
                          http2Proxy.ws(
                              req,
                              socket,
                              head,
                              {...proxyOptions, ws: undefined, proxyTimeout: options?.timeout}  as unknown as wsHttp1Options,
                              (err?: Error) => err && console.error(err)
                          );
                          return;
                      }
                    }
                });
            }
        },
    };
};