'use strict'

const port = process.env.PORT || 3000;
const Koa = require('koa');
const koaBody = require('koa-body');
const routes = require('./routes');
const userStorage = require('./userStorage');

function server(mockDb) {
    const uStorage = mockDb || userStorage();
    const app = new Koa();

    app.use(koaBody());
    const router = routes(uStorage);
    app
        .use(router.routes())
        .use(router.allowedMethods());

    console.log('Server is listening on port: ' + port);
    return app.listen(port);
}

module.exports = server;