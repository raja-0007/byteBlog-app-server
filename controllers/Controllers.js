const uuidv4 = require('uuid').v4;
const models = require('../models/Models');
const commentHandlers = require('./commentsHandler/CommentsHandler');
const chatHandlers = require('./chatHandlers/ChatHandler')
const authHandlers = require('./auth/authentication')


const {comment, viewAllComments } = commentHandlers;
const {newMessage, getChats, getChat} = chatHandlers;
const {login, signup} = authHandlers;








const authentication = async (req, res) => {
    const { email } = req.params;
    console.log(email);
    const user = await models.users.findOne({ email });

    if (user) {
        res.send({
            login: true,
            user: user.username,
            email,
            about: user.about
        });
    } else {
        res.send({
            login: false,
            user: '',
            email: ''
        });
    }
};

const home = async (req, res) => {
    try {
        const result = await models.blogs.find({});
        res.json(result.reverse());
    } catch (error) {
        console.error('Error retrieving blogs:', error);
        res.status(500).json({ message: 'Error fetching blogs' });
    }
};

const create = async (req, res) => {
    const { title, content, authorId, username, description, caption } = req.body;
    const newblog = new models.blogs({
        title,
        content,
        username,
        authorId: authorId,
        image: req.file?.filename,
        comments: [],
        likes: [],
        description:description,
        caption:caption,
        commentsCount: 0
    });
    await newblog.save()
        .then(() => res.send('blog created'));
};

const logout = (req, res) => {
    res.send('logged out');
};

const deleteBlog = async (req, res) => {
    await models.blogs.findByIdAndDelete(req.params.id);
    const blogs = await models.blogs.find({});
    res.json(blogs.reverse());
};

const update = async (req, res) => {
    const updates = req.body;
    if (req.file) {
        updates.image = req.file.filename;
    }
    await models.blogs.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.send('done');
};

const commentsLikes = async (req, res) => {
    const blog = await models.blogs.findById(req.params.id);
    res.send(blog);
};

const cmtdelblog = async (req, res) => {
    const { blogid, cmtindex } = req.params;
    const blog = await models.blogs.findById(blogid);
    blog.comments.splice(cmtindex, 1);

    await blog.save();
    res.send(blog.comments);
};

const like = async (req, res) => {
    const { id, action, userId } = req.body;
    const blog = await models.blogs.findById(id);

    console.log('blog like action', action)
    if (action === 'like') {
        blog.likes.unshift({ userId: userId });
    } else if (action === 'unlike') {
        blog.likes = blog.likes.filter(like => like.userId !== userId);
    }

    await blog.save();
    res.send({status:'done', likes:blog.likes});
};

const editprofile = async (req, res) => {
    const { email, name, about } = req.body;
    const user = await models.users.findOneAndUpdate(
        { email },
        { username: name, about },
        { new: true }
    );
    res.send(user);
};

const getprofile = async (req, res) => {
    const { user } = req.query;
    const profile = await models.users.findOne({ email: user });
    const blogs = await models.blogs.find({authorId: user})
    res.send({blogs, profile});
};

const getBlogById = async (req, res) => {
    const blogId = req.query.postId;
    console.log('blogId', blogId)
    try {
        const blog = await models.blogs.findById(blogId);   
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        console.log('blog fetched', blogId)
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog by ID:', error);
        res.status(500).json({ message: 'Error fetching blog' });
    }
};


const controllers = {
    login,
    signup,
    authentication,
    home,
    create,
    logout,
    deleteBlog,
    update,
    commentsLikes,
    comment, viewAllComments,
    cmtdelblog,
    like,
    editprofile,
    getprofile,
    getBlogById,

    newMessage, getChats, getChat
};

module.exports = controllers;
