"use strict";
const path = require("path");
module.exports = {
    publicPath: './',
    devServer: {
        port: 8080,
        proxy: {
            '/rng': {
                target: 'http://192.168.0.101:8011', // 后台接口域名
                ws: true, //如果要代理 websockets，配置这个参数
                secure: false, // 如果是https接口，需要配置这个参数
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    '^/rng': ''
                }
            }
        }
    },
    assetsDir: 'static',
    lintOnSave: false,
    // css: {
    //     loaderOptions: {
    //         less: {
    //             publicPath: '../../'
    //         }
    //     }
    // },
};