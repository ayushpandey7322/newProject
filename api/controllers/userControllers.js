const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userValidations= require('../validations/userValidation');
const validations = new userValidations;



class userControllers {
    index = async(req, res, next) => {
            if (!req.policies.includes("show_users")) {
                return res.status(404).json({ error: true,message: "unauthorized access" });
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

                    return res.status(404).json({ error: true, message: "no user with such query" });
                }
                return res.status(200).json({ error:false,data: data });
            }).catch(err => {
                return res.status(500).json({ error: true, message: err.message });
            });
    }















    me = (req, res, next) => {
        if (!req.policies.includes("show_me")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        User.findOne({ email: req.isemail }).then((data) => {
            if (data == null) {
                return res.status(404).json({ error:true,message: "user not exists" });
            }
            else {

                return res.status(200).json({ error:false,data: data });
            }

        }).catch(err => {
            return res.status(500).json({ error:true,message: err.message });
        });

    }





    show = (req, res) => {
        if (!req.policies.includes("show_users")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        User.findById({ _id: req.params.id }).then(result => {
            console.log("fd");
         
            if (result == null) {
                return res.status(404).json({ error:true,message: "not a valid id/ user not exist" });
            }
            else {
                return res.status(200).json({ error:false,data: result });
            }
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ erro:true,message: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err.message });
        });
    };


    destroy = (req, res) => {
        if (!req.policies.includes("delete_user")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        User.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error:true,message: "user doesn't exist" });
            }
       
            if (result['email'] == 'ayush2@gmail.com') {
                return res.status(401).json({ error:true,message: "can't delete admin" });
            }
                    let isActive = result['isActive'] = "false";
            s
                    User.updateOne ({ _id: req.params.id }, {
                        $set: {
                            isActive: isActive
                        }
                    },
                        { upsert: true }).then(result => { res.status(200).json({ error:false,message: "successfully deleted" }) });

               
            

        }).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error:true,message: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err })
        });



    };


    update = (req, res) => {
        if (!req.policies.includes("update")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        User.findOne({ _id: req.params.id },).then ((data) => {

            if (data == null) {
                res.status(404).json({ error:true,message: "user not exists" });

            }
            else {
                let name, email, gender;
                if (req.body.name != "") {
                    name = req.body.name == undefined ? data.name : req.body.name;

                }
                else {
                    return res.status(400).json({ error:true,message: "name field can't be empty" });
                }
                if (req.body.email != "") {

                    if (req.body.email != undefined && req.body.email.toLowerCase() != data.email.toLowerCase()) {

                        return res.status(400).json({ error:true,message: "can't update email" });
                    }

                    email = req.body.email == undefined ? data.email : req.body.email.toLowerCase();

                }
                else {
                    return res.status(400).json({ error:true,message: "email field can't be empty" });
                }

                if (req.body.gender != "") {
                    gender = req.body.gender == undefined ? data.gender : req.body.gender;
                }
                else {
                    return res.status(400).json({ error:true,message: "gender field can't be empty" });
                }

                let answer = validations.updateValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error:true,message: answer.error.details[0].message });
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
                ).then(result => { return res.status(201).json({ error:false,data: {name,email,gender} }) });

            }
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ errror:true,message: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err })
        });
    };





    updatePassword = (req, res) => {
        if (!req.policies.includes("update_password")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
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



































