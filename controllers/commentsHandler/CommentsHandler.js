const uuidv4 = require('uuid').v4;
const models = require('../../models/Models');

const comment = async (req, res) => {
    console.log('comment addition')
    const { id, commentId, comment, username, email } = req.body;
    const date = new Date().toLocaleDateString('en-US', { day: 'numeric', year: 'numeric', month: 'short' });
    // const commentId = uuidv4();
    console.log('id, ', id)
    const blog = await models.blogs.findById(id);
    const newComment = { commentId, blogId:id, comment, username: username, date, userMail: email };
    if(blog.comments.length < 2){
        blog.comments.unshift(newComment);
        await blog.save();
        res.send({status:'comment added', newComments:blog.comments}); 

    }
    else{
        const lastElement = blog.comments.pop();
        blog.comments.unshift(newComment);
        const newCmt = new models.comments(lastElement);
        await newCmt.save();
        await blog.save();

        res.send({status:'comment added', newComments:blog.comments});

    }


    console.log('comment added')
    // res.send('comment added');
};

const viewAllComments = async (req, res) => {
    const blogId = req.params.blogId
    console.log('fetching comments', blogId)
    const comments = await models.comments.find({blogId:blogId})
    res.send(comments.reverse())
}

const commentHandlers = {
    comment, viewAllComments
}

module.exports = commentHandlers;
