const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(["/finishedmeet-search","/profile-remove","/profile-upload","/forwardmeet-valid","/finishedmeet-download","/finishedmeet-delete","/finishedmeet-chat","/finishedmeet-taglist","/finishedmeet-list","/finishedmeet-info","/finishedmeet-addtag","/finishedmeet-deletetag","/meeting","/auth-login","/auth-logout","/auth-signup","/group-show", "/group-memberlist", "/group-search","/group-enter", "/group-out", "/group-create","/forwardmeet-create", "/forwardmeet-list", "/forwardmeet-delete"],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
    }));
    app.use(["/meeting",'/socket.io'],createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
    }));
};