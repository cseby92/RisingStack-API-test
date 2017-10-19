'use strict'
const mongoose = require('mongoose');
const userSchema = require('./user');
const defaultConnectionString = 'mongodb://localhost:27017/users';


function userStorage(){

    const storageObject = {};
    //TODO: get connectionstring from config
    const connectionString = defaultConnectionString;
    mongoose.connect(connectionString);
    mongoose.model('User', userSchema);
    const UserModel = mongoose.model('User');

    storageObject.addUserWithToken = async function addUserWithToken(user) {

        const userObjet = {'name' : user.name, 'email' : user.email, 'token' : user.token} //stringify?
        const newUser = new UserModel(userObjet);
        await newUser.save();
    }

    storageObject.authenticateUser = async function authenticateUser(token) {
        const tokenObject = {'token': token }
        const userFromDb = await UserModel.findOne(tokenObject);
        if(!userFromDb){
            return false;
        }else{
            return true;
        }
    }

    storageObject.getUsers = async function getUsers(){
        const usersFromDb = await UserModel.find({});
        return usersFromDb.map((usr)=> {
            return {
                name : usr.name,
                email : usr.email
            }
        });
    }
    return storageObject;

}

module.exports = userStorage;