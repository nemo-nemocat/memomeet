const {createProxyMiddleware} = require('http-proxy-middleware');


module.exports = function (app) {
    app.use(["/auth-login","/auth-logout","/auth-signup"],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
    }));
    app.use(["/group-show", "/group-memberlist", "/group-search","/group-enter", "/group-out", "/group-create"],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
    }));
};