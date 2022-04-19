
const { Post } = require('../model/postSchema');

require('dotenv').config();

const {  postValidation} = require('../validations/postValidation');
const validation = new postValidation;

class postControllers {
    store = (req, res) => {
        if (!req.token.policies.includes("create_post")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }

        let answer = validation.postValidation.validate(req.body);
        if (answer.error) {
            return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
        }
        const post = new Post({
            title: req.body.title,
            body: req.body.body,
            status: req.body.status,
            userid: req.isid
        });

        post.save().then(result => {

            return res.status(201).json({ error:false,message:"new post created",data: result });

        }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }) });

    };

    index = (req, res, next) => {
        if (!req.token.policies.includes("show_post")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        

        Post.find({ $or:
            [
            {
                userid: { $in: req.isid },
                isActive: { $in: true }
            },

            {
                userid: { $nin: req.isid },
                status: { $in: "published" },
                isActive: { $in: true }
            }
            ]
        }
        ).then(post => {
            if (post == "")
                return res.status(404).json({ error: false, message: "no post to show",data:post });
            return res.status(200).json({ error:false,message:"posts data",data: post });
     
        }).catch(err => {
          
            return res.status(500).json({ error: true, message: err.message, data: {} })
        });

    };

    show = (req, res, next) => {
        if (!req.token.policies.includes("show_post")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Post.findOne({ _id: req.params.id }).then(result => {
        
            
            if (result == null) {
            
                return res.status(404).json({ error: true, message: "post not exists", data: {} });
            }
            else {
                if (result["isActive"] == true) {
                    if (result.userid == req.isid) {
                        return res.status(200).json({error:false,message:"post data", data: result });
                    }
                    else if (result.userid != req.isid && result["status"] == "published") {
                        return res.status(200).json({ error:false,message:"post data",data: result });
                    }
                    else {
                        return res.status(401).json({ error: true, message: "not authorized to access this post", data: {} });
                    }
                }
                else {
                    return res.status(404).json({ error: true, message: "This post has been deleted", data: {} });
                }
            }
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    }




    destroy = (req, res) => {
        if (!req.token.policies.includes("delete_post")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        Post.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: "post not exists", data: {} });

            }
            else {
                if (req.isid == result.userid) {
                    let isActive = result['isActive'] = false;

                    Post.updateOne({ _id: req.params.id }, {
                        $set: {
                            isActive: isActive
                        }
                    },
                        { upsert: true }).then(result => { res.status(200).json({ error: false, message: "successfully deleted", data: {} }) });
                }
                else {
                    return res.status(404).json({ error: false, message: "this user can't delete this post", data: {}});
                }
            }
        }).catch(err => {
            if (err.name == 'CastError') {
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            }
            return res.status(500).json({ error: true, message: err.message, data: {} });
            });
    };


    update = (req, res) => {   
        if (!req.token.policies.includes("update_post")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Post.findOne({ _id: req.params.id },).then((data) => {

            if (data == null) {

                res.status(404).json({ error: true, message: "post not exists", data: {}});

            }
            else {
                 if (req.isid == data.userid) {
                let title, body, status;

                if (req.body.body != "") {
                    body = req.body.body == undefined ? data.body : req.body.body;
                }
                else {
                    return res.status(400).json({ error: true, message: "body field can't be empty", data: {} });
                }

                if (req.body.title != "") {
                    title = req.body.title == undefined ? data.title : req.body.title;
                }
                else {
                    return res.status(400).json({ error: true, message: "title field can't be empty", data: {} });
                }


                if (req.body.status != "") {
                    status = req.body.status == undefined ? data.status : req.body.status;
                }
                else {
                    return res.status(400).json({ error: true, message: "status field can't be empty", data: {} });
                }



                let answer = validation.postValidationput.validate(req.body);

                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
                }



                Post.updateOne({ _id: req.params.id }, {
                    $set: {
                        title: title,
                        body: body,
                      
                        status: status
                    }

                },
                    { upsert: true }).then(result => { res.status(201).json({ error:false,message:"updated post",data: {title,body,status} }) });
                 }
                 else {
                     return res.status(401).json({ error: true, message: "this user can't update this post", data: {}});
            }

            }
          
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {}});
           
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    };


}
module.exports = { postControllers };