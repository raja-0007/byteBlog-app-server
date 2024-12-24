const models = require('../../models/Models')

const login = async (req, res) => {
    console.log('login request', req.body)
    const { email, password } = req.body;
    const userslist = await models.users.find({ email });

    if (userslist.length !== 0) {
        const user = userslist[0];
        if (password === user.password) {
            res.send({
                status:'authenticated',
                username: user.username,
                email,
            });
        } else {
            res.send({
                status:'wrong password'
            });
        }
    } else {
        res.send({
            status:'no user found'
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
            .then(() => res.send({status:'signup successful', username:username, email}))
            .catch(() => res.send({status:'signup failed'}));
    } else {
        res.send({status:'user already exists'});
    }
};

const authHandlers = {login, signup}
module.exports = authHandlers;