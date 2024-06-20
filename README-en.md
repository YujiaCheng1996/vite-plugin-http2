![vite-http2.jpg](http://tva1.sinaimg.cn/large/005KcNyUly1gzhr1ei0b4j30gj04hjrg.jpg)

> npm i vite-plugin-http2-ws

forked from [strongcode9527/vite-plugin-http2](https://github.com/strongcode9527/vite-plugin-http2), add websocket support.

vite-plugin-http2 is a vite plugin to solve [the option "proxy" and "http2" conflict.](https://github.com/vitejs/vite/issues/484)

suport http2 and websocket proxy

this plugin can solve the following difficulties:

- The HTTPS certificate will be automatically generated for you and the configuration will be automatically modified
- use http2-proxy to implement agent function
- limited websocket support, log all errors without handling.

```javascript
// vite.config.js

import http2 from 'vite-plugin-http2-ws';

export default {
    plugins: [
        http2 ({
            // if you just use localhost, This configuration can be ignored
            certificateDomain: ['my-test.xxx.com'],
            proxy: {
                '^/api': {
                    hostname: 'localhost',
                    port: 7001,
                    async onReq(req, options) {
                        options.path = `/prefix/${options.path}`;
                    }
                },
                 '^/ws/connect/': {
                     ws: true, // support websocket proxy
                     hostname: 'xxx.com',
                     protocol: 'http or https',
                 },
            },
            // if devcert create certificate fail，you can pass your ssl option
            ssl: {
                key: '',
                cert: '',
            },
            // https://nodejs.org/api/http.html#http_http_request_options_callback
            timeout: 1000,
        }),
    ]
};

```

| key               | desc                                                                                        | default       |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------- |
| proxy             | proxy [http2-proxy options](https://github.com/nxtedition/node-http2-proxy#options)         | -             |
| certificateDomain | [HTTPS certificate domain name](https://github.com/davewasmer/devcert#multiple-domains-san) | ['localhost'] |
| ssl               | if devcert create certificate fail，you can pass your ssl option                            | -             |
| timeout           | timeout specification                                                                       | -             |

HTTPS Certificate creation fails or has strange problems during use. You can use this command to clear the cache of Certificate creation.

After restarting the development environment, you can recreate the HTTPS certificate.

```
// mac

rm -rf ~/Library/"Application Support"/devcert/

```
