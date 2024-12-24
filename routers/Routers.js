const controllers = require('../controllers/Controllers')
const express = require('express')
const multer = require('multer') //for image uploads
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
})


const upload = multer({storage:storage, limits: { fileSize: 10 * 1024 * 1024 },})

const router = express.Router()






module.exports =(io)=>{
    
    router.post('/login', controllers.login)
    router.post('/signup', controllers.signup)
    router.get('/authentication/:email', controllers.authentication)
    router.get('/home', controllers.home)
    router.post('/create' , upload.single('image'), controllers.create)
    router.get('/logout', controllers.logout)
    router.get('/delete/:id', controllers.deleteBlog)
    router.post('/update/:id' , upload.single('image'), controllers.update)
    router.get('/comments-likes/:id', controllers.commentsLikes)
    router.post('/comment', controllers.comment)
    router.get('/viewallcomments/:blogId', controllers.viewAllComments)
    router.get('/cmtdelblog/:blogid/cmtdelcmt/:cmtindex', controllers.cmtdelblog)
    router.post('/like', controllers.like)
    router.post('/editprofile',controllers.editprofile)
    router.get('/getprofile/:user',controllers.getprofile)
    
    
    router.post('/newMessage', (req, res)=>controllers.newMessage(req, res, io))
    router.get('/getChats', (req, res)=>controllers.getChats(req, res, io))
    

    return router;
} 