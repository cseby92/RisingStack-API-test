'use strict';

const server = require('./app');
const mockUserStorage =  require('./mockUserStorage');
const serverObject = server(mockUserStorage);
const config = require('./config');
const request = require('supertest').agent(serverObject);
const chai = require('chai');
chai.use(require('chai-things'));
const expect = chai.expect;
const sinon = require('sinon');

describe('RisingstackApi', ()=> {
    after(function(){
        serverObject.close();
    });
    const users = [{
            name: 'John Cena',
            email: 'jcena@asdmail.com'
        },
        {
            name: 'Kevin Durant',
            email: 'kevind@asdfmal.com'
        },
        {
            name: 'Nagy Antal',
            email: 'nagyantal@frmail.com'
        },
        {
            name: 'Kiss Nora',
            email: 'knora@wtsdgfermail.com'
        }
    ];
    
    function addTokenToUser(user) {
        const copy = Object.assign({}, user);
        copy.token = config.token;
        return copy;
    }

    describe('/registration POST', ()=>{


    it('should register a user', function(done) {
        request
            .post('/registration')
            .send(users[0])
            .expect(200)
            .end(function (err, res) {
                expect(mockUserStorage.users)
                    .to.include.something.that.eqls(addTokenToUser(users[0]));
                mockUserStorage.clear();
                done();
            });
    });

    it('should send an error for bad parameters', function(done) {
        const reqBody = {
            name: '',
            email: 'examplejohndoeemail@gmail.com'
        }
        request
            .post('/registration')
            .send(reqBody)
            .expect(422)
            .end(done);
    });
    it('should send an error for bad parameters', function(done) {
        const reqBody = {
            name: 'asd',
            email: 'examplejohndgmail.com'
        }
        request
            .post('/registration')
            .send(reqBody)
            .expect(422)
            .end(done);
    });
    it('should register two users', function(done) {
        request
            .post('/registration')
            .send(users[0])
            .expect(422)
            .end(function () {
                expect(mockUserStorage.users)
                    .to.include.something.that.eqls(addTokenToUser(users[0]));
                    expect(mockUserStorage.users.length).to.eql(1);
                request
                    .post('/registration')
                    .send(users[1])
                    .expect(422)
                    .end(function() {
                        expect(mockUserStorage.users)
                            .to.include.something.that.eqls(addTokenToUser(users[0]));
                        expect(mockUserStorage.users)
                            .to.include.something.that.eqls(addTokenToUser(users[1]));

                        expect(mockUserStorage.users.length).to.eql(2);
                        mockUserStorage.clear();
                        done();
                    });
            });
        });
    });

    describe('/users GET', function() {
        it('should list one user', function(done) {
            request
                .post('/registration')
                .send(users[0])
                .expect(200)
                .end(function () {
                    request
                        .get('/users')
                        .query({token: config.token})
                        .expect(200)
                        .end(function (err, res) {
                            expect(res.body)
                                .to.include.something.that.eqls(users[0]);
                            mockUserStorage.clear();
                            done();
                        });
                });
        });

        it('should list all users', function(done) {
            request
                .post('/registration')
                .send(users[0])
                .expect(200)
                .end(function () {
                    request
                        .post('/registration')
                        .send(users[1])
                        .expect(200)
                        .end(function () {
                            request
                                .get('/users')
                                .query({token: config.token})
                                .send()
                                .expect(200)
                                .end(function (err, res) {
                                    expect(res.body)
                                        .to.include.something.that.eqls(users[0]);
                                    expect(res.body)
                                        .to.include.something.that.eqls(users[1]);
                                    mockUserStorage.clear();
                                    done();
                                });
                        })
                })


        });

        it('should send an error unauthorized', function(done) {
            request
                .get('/users')
                .query({token : 'mySecretTokenasd'})
                .send()
                .expect(401)
                .end(done);
        });
    });
});