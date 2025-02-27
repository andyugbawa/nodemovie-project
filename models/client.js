// const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})


UserSchema.plugin(passportLocalMongoose);

const Client = mongoose.model("Client", UserSchema)



module.exports = Client;

