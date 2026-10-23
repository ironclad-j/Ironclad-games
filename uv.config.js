// SPDX-License-Identifier: AGPL-3.0-only
const configScript=typeof document!=='undefined'?document.currentScript.src:self.location.href;
const siteRoot=new URL('./',configScript).pathname;
self.__uv$config={prefix:siteRoot+'browser/uv/',encodeUrl:Ultraviolet.codec.xor.encode,decodeUrl:Ultraviolet.codec.xor.decode,handler:siteRoot+'vendor/uv/uv.handler.js',client:siteRoot+'vendor/uv/uv.client.js',bundle:siteRoot+'vendor/uv/uv.bundle.js',config:siteRoot+'uv.config.js',sw:siteRoot+'vendor/uv/uv.sw.js'};
