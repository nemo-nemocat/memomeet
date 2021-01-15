const {createProxyMiddleware} = require('http-proxy-middleware');


module.exports = function (app) {
    app.use(["/auth-login","/auth-logout","/auth-signup","/group-show", "/group-memberlist"],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
    }));

    app.use(["/meeting","/meeting-start"],createProxyMiddleware({
        target: 'http://localhost:3003',
        changeOrigin: true,
    }));
};