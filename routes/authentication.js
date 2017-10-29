const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
module.exports = (router) => {
    router.post('/register', (req, res) => {
        if (!req.body.email) {
            res.json({ success: false, message: 'email must be provided' });
        } else {
            if (!req.body.username) {
                res.json({ success: false, message: 'username must be provided' });
            } else {
                if (!req.body.password) {
                    res.json({ success: false, message: 'password must be provided' });
                } else {
                    let user = new User({
                        email: req.body.email.toLowerCase(),
                        username: req.body.username.toLowerCase(),
                        password: req.body.password
                    });
                    user.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                res.json({ success: false, message: 'user already exists' });
                            } else {
                                if (err.errors) {
                                    if (err.errors.email) {
                                        res.json({ success: false, message: err.errors.email.message });

                                    } else {
                                        if (err.errors.username) {
                                            res.json({ success: false, message: err.errors.username.message });
                                        } else {
                                            if (err.errors.password) {
                                                res.json({ success: false, message: err.errors.password.message });
                                            } else {
                                                res.json({ success: false, message: err });
                                            }
                                        }
                                    }

                                } else {
                                    res.json({ success: false, message: 'could not save user', err });
                                }
                            }
                        } else {
                            res.json({ success: true, message: 'user saved' });
                        }
                    });
                }
            }
        }

    });
    //check email
    router.get('/checkEmail:email', (req, res) => {
        if (!req.params.email) {
            res.json({ success: false, message: 'email not provided' });
        } else {
            User.findOne({ email: req.params.email }, (err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (user) {
                        res.json({ success: false, message: 'email already taken' });
                    } else {
                        res.json({ success: true, message: 'email is avialable' });
                    }
                }
            })
        }
    });
    //check user
    router.get('/checkUsername:username/', (req, res) => {
        if (!req.params.username) {
            res.json({ success: false, message: 'provide username' });
        } else {
            User.findOne({ username: req.params.username }, (err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (user) {
                        res.json({ success: false, message: 'username already taken' });
                    } else {
                        res.json({ success: true, message: 'username is available' });
                    }
                }
            })
        }
    });
    // login route
    router.post('/login', (req, res) => {
        if (!req.body.username) {
            res.json({ success: false, message: 'A username is required' });
        } else {
            if (!req.body.password) {
                res.json({ success: false, message: 'A password is required' });
            } else {
                User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'username not found' });
                        } else {

                            const validpassword = user.comparePassword(req.body.password);

                            if (validpassword) {
                                const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '1hr' });
                                res.json({ success: true, message: 'success', token: token, user: { username: user.username } });

                            } else {
                                res.json({ success: false, message: 'invalid password' });
                            }
                        }
                    }
                })
            }
        }
    });
    //middleware 
    router.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            res.json({ success: false, message: 'no token was provided' });
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    res.json({ success: false, message: 'invalid token ' + err });
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        }
    });
    //profile
    router.get('/profile', (req, res) => {
        User.findOne({ _id: req.decoded.userId }).select("username email").exec((err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'user not found' });
                } else {
                    res.json({ success: true, user: user });
                }
            }
        });
    });
    //public profile
    router.get('/public/:username', (req, res) => {
        if (!req.params.username) {
            res.json({ success: false, message: "no user was provided" });
        } else {
            User.findOne({username: req.params.username }).select('username email').exec((err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!user) {
                        res.json({ success: false, message: "user was not found" });
                    } else {
                        res.json({ success: true, user: user });
                    }
                }
            })
        }
    });
    return router;
}