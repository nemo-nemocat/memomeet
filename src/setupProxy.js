const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(["/meeting","/auth-login","/auth-logout","/auth-signup","/group-show", "/group-memberlist", "/group-search","/group-enter", "/group-out", "/group-create","/forwardmeet-create", "/forwardmeet-list", "/forwardmeet-delete",'/socket.io'],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
    }));
};