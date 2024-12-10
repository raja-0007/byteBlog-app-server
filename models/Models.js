const mongoose = require('mongoose')


const userschema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    about:String

})
const blogschema = mongoose.Schema({
    title: String,
    content: String,
    username: String,
    user: String,
    image: String,
    comments: Array,
    likes: Array,
    description: String,
    caption: String
})

const commentSchema = mongoose.Schema({
    commentId: String,
    comment: String,
    username: String,
    date: String,
    userMail: String
})


const blogs = new mongoose.model('blogs', blogschema)
const users = new mongoose.model('users', userschema)
const comments = new mongoose.model('comments', commentSchema)


const models = {users, blogs, comments}

module.exports = models;