const models = require('../models/Models');

const login = async (req, res) => {
    const { email, password } = req.body;
    const userslist = await models.users.find({ email });

    if (userslist.length !== 0) {
        const user = userslist[0];
        if (password === user.password) {
            res.send({
                login: true,
                user: user.username,
                email,
                about: user.about,
                pstatus: true,
                exist: true
            });
        } else {
            res.send({
                login: false,
                user: '',
                email: '',
                pstatus: false,
                exist: true
            });
        }
    } else {
        res.send({
            login: false,
            user: '',
            email: '',
            pstatus: false,
            exist: false
        });
    }
};

const signup = async (req, res) => {
    const { username, email, password } = req.body;
    const userslist = await models.users.find({ email });

    if (userslist.length === 0) {
        const user = new models.users({
            username,
            email,
            password,
            about: '-'
        });
        await user.save()
            .then(() => res.send(true))
            .catch(() => res.send(false));
    } else {
        res.send(false);
    }
};

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
    await models.blogs.find({})
        .then(result => {res.json(result.reverse())});
};

const create = async (req, res) => {
    const { title, content, email, username } = req.body;
    const newblog = new models.blogs({
        title,
        content,
        username,
        user: email,
        image: req.file?.filename,
        comments: [],
        likes: []
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

const comment = async (req, res) => {
    const { id, comment, username, email } = req.body;
    const date = new Date().toLocaleDateString('en-US', { day: 'numeric', year: 'numeric', month: 'short' });

    const blog = await models.blogs.findById(id);
    blog.comments.unshift({ comment, user: username, date, userMail: email });

    await blog.save();
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
    const { id, action, email } = req.body;
    const blog = await models.blogs.findById(id);

    if (action === 'like') {
        blog.likes.unshift({ user: email });
    } else if (action === 'unlike') {
        blog.likes = blog.likes.filter(like => like.user !== email);
    }

    await blog.save();
    res.send(blog.likes);
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
    const { user } = req.params;
    const profile = await models.users.findOne({ email: user });
    res.send(profile);
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
    comment,
    cmtdelblog,
    like,
    editprofile,
    getprofile
};

module.exports = controllers;
