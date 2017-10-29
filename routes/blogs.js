const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
module.exports = (router) => {

    router.post('/newblog', (req, res) => {
        if (!req.body.title) {
            res.json({ success: false, message: "title of the blog is required" });
        } else {
            if (!req.body.body) {
                res.json({ success: false, message: "body of the blog is required" });
            } else {
                if (!req.body.createdBy) {
                    res.json({ success: false, message: "creator of the blog is required" });
                } else {
                    const blog = new Blog({
                        title: req.body.title,
                        body: req.body.body,
                        createdBy: req.body.createdBy
                    });
                    blog.save((err) => {
                        if (err) {
                            if (err.errors) {
                                if (err.errors.title) {
                                    res.json({ success: false, message: err.errors.title.message });

                                } else {
                                    if (err.errors.body) {
                                        res.json({ success: false, message: err.errors.body.message });
                                    } else {
                                        res.json({ success: false, message: err.errors.errmsg });
                                    }
                                }
                            } else {
                                res.json({ success: false, message: err });

                            }

                        } else {
                            res.json({ success: true, message: "blog has been saved" });
                        }
                    })
                }
            }
        }
    });
    router.get('/all', (req, res) => {
        Blog.find({}, (err, blogs) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!blogs) {
                    res.json({ success: false, message: 'No blogs found' });
                } else {
                    res.json({ success: true, blogs: blogs })
                }
            }
        }).sort({ '_id': -1 });
    });

    router.get('/singleblog/:id', (req, res) => {
        if (!req.params.id) {
            res.json({ success: false, message: 'no id was provided' });
        } else {
            Blog.findOne({ _id: req.params.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: "wrong id provided" });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "no blog was found" })
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "you are not allowed to edit this blog" });
                                } else {
                                    res.json({ success: true, blog: blog });

                                }
                            }
                        });

                    }
                }
            })
        }
    });
    router.put('/update', (req, res) => {
        if (!req.body._id) {
            res.json({ success: false, message: "blog id not found" });
        } else {
            Blog.findOne({ _id: req.body._id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "blog was not found" });

                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });

                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "unable to authenticate user" });
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "you are not allowed to edit the post" });

                                    } else {

                                        blog.title = req.body.title;
                                        blog.body = req.body.body;
                                        blog.save((err) => {
                                            if (err) {
                                                res.json({ success: false, message: err });

                                            } else {
                                                res.json({ success: true, message: "blog was edited" });
                                            }
                                        });
                                    }

                                }
                            }
                        });
                    }
                }
            });
        }
    });
    router.delete('/delete/:id', (req, res) => {
        if (!req.params.id) {
            res.json({ success: false, message: "id not provided" });
        } else {
            Blog.findOne({ _id: req.params.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "blog was not found" })
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "could not authenticate user" });
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "user is not allowed to delete blog" });
                                    } else {
                                        blog.remove((err) => {
                                            if (err) {
                                                res.json({ success: false, message: err });
                                            } else {
                                                res.json({ success: true, message: "blog has been deleted" });
                                            }
                                        })
                                    }
                                }
                            }

                        })
                    }
                }
            })
        }
    });
    router.put('/like', (req, res) => {
        if (!req.body.id) {
            res.json({ success: false, message: 'id was not provided' });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "blog was not found" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "user could not be found" })
                                } else {
                                    if (user.username === blog.createdBy) {
                                        res.json({ success: false, message: "you cannot like your own post" })
                                    } else {
                                        //check whether they have already liked the post
                                        if (blog.likedBy.includes(user.username)) {
                                            res.json({ success: false, message: "you have already liked this post" });
                                        } else {
                                            //check whether they have disliked the post
                                            if (blog.dislikedBy.includes(user.username)) {
                                                //decrement the dislikes
                                                blog.dislikes--;
                                                //find the indexOf the user in the dislikes
                                                const arrayIndex = blog.dislikedBy.indexOf(user.username);
                                                //splice the array
                                                blog.dislikedBy.splice(arrayIndex, 1);
                                                //increament the likedby
                                                blog.likes++;
                                                //push the user to the likedby array
                                                blog.likedBy.push(user.username);
                                                //save the blog
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: err });
                                                    } else {
                                                        res.json({ success: true, message: "You liked this blog" });
                                                    }
                                                });
                                            } else {
                                                blog.likes++;
                                                //push the user to the likedby array
                                                blog.likedBy.push(user.username);
                                                //save the blog like
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: err });
                                                    } else {
                                                        res.json({ success: true, message: "You liked this blog" });
                                                    }
                                                });

                                            }

                                        }
                                    }
                                }
                            }
                        })
                    }
                }
            });
        }
    });
    router.put('/dislike', (req, res) => {
        if (!req.body.id) {
            res.json({ success: false, message: "No id provided" });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
               if (err) {
                  res.json({success:false,message:err});
               }else{
                  if(!blog){
                     res.json({success:false,message:"no blog was found"});
                  }else{
                      User.findOne({_id:req.decoded.userId},(err,user)=>{
                       if(err){
                           res.json({success:false,message:err});
                       }else{
                          if(!user){
                               res.json({success:false,message:"user cannot be authenticated"})
                          }else{
                              if(user.username === blog.createdBy){
                                   res.json({success:false,message:"you cannot like your own post"});
                              }else{
                                  //check whether they have disliked the post
                                  if(blog.dislikedBy.includes(user.username)){
                                   res.json({success:false,message:"you have already disliked this post"});
                                  }else{
                                    //check whether they have liked the post
                                    if(blog.likedBy.includes(user.username)){
                                     //decrement the likedby
                                     blog.likes--;
                                     //find the indecof the like
                                     const arrayIndex=blog.likedBy.indexOf(user.username);
                                     //splice the array
                                     blog.likedBy.splice(arrayIndex,1);
                                     //increament dislikedby
                                     blog.dislikes++;
                                     //push the disliker to the array
                                     blog.dislikedBy.push(user.username);
                                     //save the dislike
                                     blog.save((err)=>{
                                          if(err){
                                             res.json({success:false,message:err});
                                          }else{
                                              res.json({success:true,message:"blog disliked"});
                                          }
                                     });
                                    }else{
                                          blog.dislikes++;
                                     //push the disliker to the array
                                     blog.dislikedBy.push(user.username);
                                     //save the dislike
                                     blog.save((err)=>{
                                          if(err){
                                             res.json({success:false,message:err});
                                          }else{
                                              res.json({success:true,message:"blog disliked"});
                                          }
                                     });
                                    }
                                  }
                              }
                          }
                       }
                  });
                  }
               }
            });
        }
    }
    );
    router.post('/comment',(req,res)=>{
     if(!req.body.comment){
        res.json({success:false,message:'no comment was provided'});
     }else{
       if(!req.body.id){
           res.json({success:false,message:'no blog id was provided'});
       }else{
         Blog.findOne({_id :req.body.id},(err,blog)=>{
           if(err){
                res.json({success:false,message:err});
           }else{
              if(!blog){
                res.json({success:false,message:'no blog was found'});
              }else{
                 User.findOne({_id:req.decoded.userId},(err,user)=>{
                 if(err){
                    res.json({success:false,message:err});
                 }else{
                  if(!user){
                    res.json({success:false,message:'user not found'});
                  }else{
                      blog.comments.push({
                          comments:req.body.comment,
                          commentator:user.username
                      });
                     blog.save((err)=>{
                         if(err){
                            res.json({success:false,message:err})
                         }else{
                         res.json({success:true,message:'comment saved successfully'});
                         }
                     });
                  }
                 }
                 });
              }
           }
         });
       }
     }
    });
    return router;
}