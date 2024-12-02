const controllers = require('../controllers/Controllers')
const express = require('express')
const multer = require('multer') //for image uploads
const path = require('path');

const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,'images')
    },
    filename:(req, file, cb)=>{
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})


const upload = multer({storage:storage})

const router = express.Router()

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
router.get('/cmtdelblog/:blogid/cmtdelcmt/:cmtindex', controllers.cmtdelblog)
router.post('/like', controllers.like)
router.post('/editprofile',controllers.editprofile)
router.get('/getprofile/:user',controllers.getprofile)






module.exports = router;