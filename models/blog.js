const mongoose = require('mongoose');
const promise = global.Promise;
const Schema = mongoose.Schema;


let titleLengthChecker = (title) => {
    if (!title) {
        return false;
    } else {
        if (title.length < 5 || title.length > 50) {
            return false;
        }
        return true;
    }
}

let alphanumerictitle = (title) => {
    if (!title) {
        return false;

    } else {
        const regExp = new RegExp( /^[a-zA-Z0-9 ]+$/);
        return regExp.test(title);
    }
}
const titleValidators = [{
    validator: titleLengthChecker,
    message: 'title should not be less than 5 or greater than 50'
}, {
    validator: alphanumerictitle,
    message: 'provide an alphanumeric  title'
}]
let bodyLengthChecker = (body) => {
    if (!body) {
        return false;
    } else {
        if (body.length < 10 || body.length > 500) {
            return false;
        } else {
            return true;
        }
    }
}


const bodyValidators = [{
    validator: bodyLengthChecker,
    message: 'body must be more than 10 and less than 500'
}]
let commentLengthChecker = (comment) => {
    if (!comment[0]) {
        return false;
    } else {
        if (comment[0].length < 1 || comment[0].length > 200) {
            return false;
        } else {
            return true;
        }
    }
}

const commentvalidator = [{
    validator: commentLengthChecker,
    message: 'comment must be greater than 1 and less than 200'
}]
const blogSchema=new Schema({
    title:{
        type:String,
        required:true,
        validate :titleValidators
    },
    body:{
        type:String,
        required:true,
        validate: bodyValidators
    },
    createdBy:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    likes:{
        type:Number,
        default:0
    },
    likedBy:{
        type:Array
    },
     dislikes:{
        type:Number,
        default:0
    },
    dislikedBy:{
        type:Array
    },
    comments:[
        {
            comments:{
                type:String,
                validate:commentvalidator
            },
            commentator:{
                type:String
            }
        }
    ]
});


module.exports = mongoose.model('blog', blogSchema);