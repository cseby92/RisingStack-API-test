'use strict';
const config = require('./config');

const mockUserStorage = {
    users: [],
    addUserWithToken: function(user) {
        const myToken = config.token;
        this.users.push({
            name: user.name,
            email: user.email,
            token: myToken
        });
    },
    authenticateUser: function(token) {
        const tokenObject = {'token': token };
        const userFromArray = this.users.find(function (user) {
            if(user.token === tokenObject.token){
                return true;
            }
            return false;
        });

        if(userFromArray)
            return true;
        return false;
    },
    getUsers: function() {
        return this.users.map(function (user) {
            return {
                name: user.name,
                email: user.email
            }
        });
    },
    clear: function(){
        this.users = [];
    }
}


module.exports = mockUserStorage;