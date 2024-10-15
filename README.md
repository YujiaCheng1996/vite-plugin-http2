[README for english](https://github.com/YujiaCheng1996/vite-plugin-http2/blob/master/README-en.md)

![vite-http2.jpg](http://tva1.sinaimg.cn/large/005KcNyUly1gzhr1ei0b4j30gj04hjrg.jpg)

> npm i vite-plugin-http2-ws

fork 自 [strongcode9527/vite-plugin-http2](https://github.com/strongcode9527/vite-plugin-http2) ，在其上增加 websocket 支持。

vite-plugin-http2-ws 是一个 vite 插件，是为了解决 [vite 无法同时开启 proxy 代理以及 http2 的问题](https://github.com/vitejs/vite/issues/484)

支持正常 http2 以及 websocket 转发

改用esm打包，支持vite新版本，换用mkcert，支持node最新版本，并无需指定域名

这个插件可以解决以下难题

- 使用 mkcert 库自动生成 https 证书，并且自动配置在系统内部（第一次进入开发环境，需要输入密码将证书放入系统指定目录）
- 使用 http2-proxy 进行代理转发。
- 有限支持 websocket，仅 log error 不能处理。

```javascript
// vite.config.js

import http2 from "vite-plugin-http2-ws";

export default {
  plugins: [
    http2({
      proxy: {
        // 创建正则表达式的字符串，这里识别需要代理的接口
        "^/api": {
          hostname: "localhost",
          port: 7001,
          async onReq(req, options) {
            // 如果路径需要修改，可以在这里修改添加
            options.path = `/prefix/${options.path}`;
          },
        },
        '^/ws/connect/': {
            ws: true, // support websocket proxy
            hostname: 'xxx.com',
            protocol: 'http or https',
        },
      },
      // 如果 https 证书创建失败，可以自己创建，并在这里传入
      ssl: {
        key: "",
        cert: "",
      },
      // 超时时间，不填则为node环境http_request默认超时时间
      timeout: 1000,
    }),
  ],
};
```

| key               | desc                                                                                        | default       |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------- |
| proxy             | proxy [http2-proxy options](https://github.com/nxtedition/node-http2-proxy#options)         | -             |
| ssl               | if mkcert create certificate fail，you can pass your ssl option                            | -             |
| timeout           | timeout specification                                                                       | -             |

使用过程中 https 证书创建失败，或出现诡异问题，可使用此命令清除证书创建的缓存。

重启开发环境后，便可重新创建 https 证书。
