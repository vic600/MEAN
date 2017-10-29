const mongoose = require('mongoose');
const promise=global.Promise;
const Schema = mongoose.Schema;
const bcrypt=require('bcrypt-nodejs');

let emailLengthChecker=(email)=>{
    if(!email){
        return false;
    }else{
        if(email.length < 8 || email.length >30){
         return false;
        }
        return true;
    }
}

let validEmail=(email)=>{
if(!email){
return false;

}else{
    const regExp=new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return regExp.test(email);
}
}
const emailValodators=[{
    validator:emailLengthChecker,
    message:'email should not be less than 8 or greater than 30'
},{
    validator:validEmail,
    message:'provide a valid email'
}]
let usernameLengthChecker=(username)=>{
    if(!username){
     return false;
    }else{
    if(username.length < 3 || username.length > 30){
    return false;
    }else{
        return true;
    }
    }
}
 
let validUsername=(username)=>{
if(!username){
return false;
}else{
    const regExp= new RegExp(
        /^[a-zA-Z0-9]+$/
    );
    return regExp.test(username);
}
}
const usernameValidators=[{
    validator:usernameLengthChecker,
    message:'username must be more than 3 and less than 35'
},{
    validator:validUsername,
    message:'username must not contain special characters'
}]
let passwordLengthChecker=(password)=>{
 if(!password){
return false;
 }else{
if(password.length < 8 || password.length >35){
return false;
}else{
    return true;
}
 }
}

let validpassword=(password)=>{
   if(!password){
    return false;
   }else{
       const regExp=new RegExp(
           /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/
       );
       return regExp.test(password);
   }
}
const passwordvalidator=[{
    validator:passwordLengthChecker,
    message:'password must be greater than 8 and less than 35'
},{
    validator:validpassword,
    message:'password must contain uppercase ,lowercase special character and number'
}]
const  userSchema = new Schema({
email:{type:String,required:true,unique:true,lowercase:true , validate:emailValodators},
username: { type: String, required: true,unique:true, lowercase: true,validate:usernameValidators },
password: { type: String, required: true,validate:passwordvalidator},
});

userSchema.pre('save',function(next){
if(!this.isModified('password'))
    return next();

bcrypt.hash(this.password,null,null,(err,hash)=>{
if(err)return next(err);
this.password=hash;
next();
});
});

userSchema.methods.comparePassword=function(password){
    return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('user', userSchema);