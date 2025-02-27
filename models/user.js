const express = require("express");
const mongoose =require("mongoose")
const bcrypt = require ("bcrypt")



const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is Required"]
    },
    password:{
        type:String,
        required:[true,"Password is Required"]
    }
})


userSchema.statics.findAndValidate = async function (username, password) {
    const user = await this.findOne({ username });
    if (!user) return false; 
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : false;
};


userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password =await bcrypt.hash(this.password,12);
    next();
})


const User = mongoose.model("User",userSchema);

module.exports = User;




// userSchema.statics.findAndValidate = async function(username,password){
//     const foundUser = await this.findOne({username});
//     const isVaild = await bcrypt.compare(password,foundUser.password);
//     return isVaild ? foundUser:false;
// }