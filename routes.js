'use strict';

const Router = require('koa-router');
const tokenGenerator = require('rand-token')
const URL = require('url').URL;
const nodeMailer = require('nodemailer');
const config = require('./config');

function routes(userStorage){

    const router = new Router();
    router
        .get('/users',async function(ctx) {
            try{
                if(await userStorage.authenticateUser(ctx.query.token)) {
                    ctx.body = await userStorage.getUsers();
                    ctx.response.status = 200;
                }else {
                    ctx.response.status = 401;
                }
            }catch(ex){
                console.log(ex.message);
                ctx.response = 500;
            }
        })
        .post('/registration', async function(ctx) {

            try{
                const user = {
                    name: ctx.request.body.name,
                    email: ctx.request.body.email,
                };
                const isEmailValid = validateEmail(user.email);
                if(!isEmailValid || user.name === ''){
                    ctx.response.status = 422;
                    return;
                }

                addUserWithTokenToStorage(user, userStorage);
                const userUrl = createUrl(user.token);
                sendUrlToMail(user.email, userUrl);
                ctx.response.status = 200;
            }catch(ex) {
                console.log(ex.message);
                ctx.response = 500;
            }

        })
        .all('*', function(ctx) {
                ctx.response.status = 404;
                ctx.response.body = 'Not existing page';
        });

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    async function addUserWithTokenToStorage(user, userStorage){
        const userToken = tokenGenerator.generate(32);
        user.token = userToken;
        await userStorage.addUserWithToken(user);
    }

    function createUrl(token) {
        const myUrl = new URL('/users',config.url);
        myUrl.searchParams.append('token', token);
        return myUrl;
    }

    function sendUrlToMail(to, url){
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.email,
            to: to,
            subject: 'Automated registration email from rising',
            text: url.href
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
    }
    return router;
}

module.exports = routes;
