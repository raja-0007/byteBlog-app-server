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
    likes: Array
})


const blogs = new mongoose.model('blogs', blogschema)
const users = new mongoose.model('users', userschema)

const models = {users, blogs}
module.exports = models;