const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Token } = require('../model/tokenSchema');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userValidations= require('../validations/userValidation');
const validations = new userValidations;



class userControllers {
    index = async(req, res, next) => {
            if (!req.token.policies.includes("show_users")) {
                return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }

            let keys = Object.keys(req.query);
            let filters = new Object();
            if (keys.includes("name")) {

                filters.name = { $regex: req.query["name"], $options: "i" };
            }
            if (keys.includes("email")) {
                filters.email = { $regex: req.query["email"], $options: "i" };
            }
            if (keys.includes("gender")) {
                filters.gender = { $regex: req.query["gender"], $options: "i" };
            }
            if (keys.includes("isActive")) {
                filters.isActive = { $regex: req.query["isActive"], $options: "i" };
            }

            User.find(filters).then(data => {

                if (data.length == 0) {

                    return res.status(404).json({ error: false, message: "no user with such query" ,data:data});
                }
                return res.status(200).json({ error:false,nessage:"users data",data: data });
            }).catch(err => {
                return res.status(500).json({ error: true, message: err.message, data: {} });
            });
    }















    me = (req, res, next) => {
        if (!req.token.policies.includes("show_me")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        User.findOne({ email: req.isemail }).then((data) => {
            if (data == null) {
                return res.status(404).json({ error: true, message: "user not exists", data: {} });
            }
            else {

                return res.status(200).json({ error:false,message:"my data",data: data });
            }

        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message, data: {}});
        });

    }





    show = (req, res) => {
        if (!req.token.policies.includes("show_users")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        User.findById({ _id: req.params.id }).then(result => {
           // console.log("fd");
         
            if (result == null) {
                return res.status(404).json({ error: true, message: "not a valid id/ user not exist", data: {} });
            }
            else {
                
                if (result.isActive == "false")
                    return res.status(200).json({ error: false, message:"deleted user",data: result });
                return res.status(200).json({ error:false,message:"user data",message:"user data",data: result });
            }
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    };


    destroy = async(req, res) => {
        console.log("fa");
        if (!req.token.policies.includes("delete_user")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
       // console.log(req.params.id);
        await User.findOne({ _id: req.params.id }).then (async result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: "user not exists", data: {} });
            }
           // console.log("destroy",result);
            result.isActive = "false";
            await result.save().then(result => {
                return res.status(200).json({
                    error: false, message: "successfully deleted", data: {}
                });
            });
           await Token.find({
               userid: { $in: result._id }
           }).then(
               data => {
                   console.log(data);
                   for (let i = 0; i < data.length; i++) {
                       data[i].status = "blacklisted";
                       data[i].save();
                   }
               })
            /*
                    User.updateOne ({ _id: req.params.id }, {
                        $set: {
                            isActive: isActive
                        }
                    },
                        { upsert: true }).then(result => { res.status(200).json({ error: false, message: "successfully deleted", data: {} }) });
                        */

        }).catch(err => {
            if (err.name == 'CastError') 
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} });
            
            
        });



    };


    update = (req, res) => {
        if (!req.token.policies.includes("update")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        User.findOne({ _id: req.params.id },).then ((data) => {

            if (data == null) {
                res.status(404).json({ error: true, message: "user not exists", data: {}});

            }
            else {
                let name, email, gender;
                if (req.body.name != "") {
                    name = req.body.name == undefined ? data.name : req.body.name;

                }
                else {
                    return res.status(400).json({ error: true, message: "name field can't be empty", data: {} });
                }
                if (req.body.email != "") {

                    if (req.body.email != undefined && req.body.email.toLowerCase() != data.email.toLowerCase()) {

                        return res.status(400).json({ error: true, message: "can't update email", data: {}});
                    }

                    email = req.body.email == undefined ? data.email : req.body.email.toLowerCase();

                }
                else {
                    return res.status(400).json({ error: true, message: "email field can't be empty", data: {}});
                }

                if (req.body.gender != "") {
                    gender = req.body.gender == undefined ? data.gender : req.body.gender;
                }
                else {
                    return res.status(400).json({ error: true, message: "gender field can't be empty", data: {}});
                }

                let answer = validations.updateValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
                }
                User.updateOne (
                    { _id: req.params.id },
                    {
                        $set:
                        {
                            name: name,
                            email: email,
                            gender: gender,
                            token: data.token
                        }

                    },
                    { upsert: true }
                ).then(result => { return res.status(201).json({ error:false,message:"updated policy",data: {name,email,gender} }) });

            }
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ errror: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} })
        });
    };





    updatePassword = (req, res) => {
        if (!req.token.policies.includes("update_password")) {
            return res.status(401).json({ error: true, message: "unauthorized access" });
        }
        User.findOne({ _id: req.params.id },).then((data) => {

            if (data == null) {

                return res.status(404).json({ error:true,message: "user not exists" });

            }

                let password;

                if (req.body.password == "") {
                    return res.status(404).json({ error:true,message: "password field can't be empty" });
                }
                else {
                    password = req.body.password == undefined ? data.password : req.body.password;

                    bcrypt.hash(password, 10, function (err, hash) {
                        if (err) {
                            throw err;
                        }
                        else {

                            let answer = validations.updatePasswordValidations.validate(req.body);

                            if (answer.error) {
                                return res.status(400).json({ error:true,message: answer.error.details[0].message });
                            }


                            User.updateOne(
                                { _id: req.params.id },
                                {
                                    $set:
                                    {
                                        password: hash,

                                    }
                                },
                                { upsert: true }).then(result => { return res.status(200).json({ error:false,message:"successfully updated password" }) });
                        }
                    });
                }

            

        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({error:true,messaage: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err.message });
        });
    };

}







module.exports =  userControllers ;



































