const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Policy } = require('../model/policySchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authControllersValidation = require('../validations/authControllersValidation');
const validations = new authControllersValidation;


class authControllers {
    createUsers = async (req, res) => {

        if (req.body.roleid == 0 && !req.policies.includes("create_superadmin")) {

            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        if (req.body.roleid == 1 && !req.policies.includes("create_admin")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        if (req.body.roleid == 2 && !req.policies.includes("create_user")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        User.findOne({ email: req.body.email }).then(async (data) => {
            if (data == null) {

                let answer = validations.createUsersValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message });
                }
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: true, message: err.message })
                    }
                    else {
                        //////////////////////////////////////////////
                        var rolesIds = [];
                        await Role.find().then(result => {
                            for (let i = 0; i < result.length; i++) {
                                rolesIds.push(result[i]._id);
                            }
                        })
                        if (!rolesIds.includes(req.body.roleid)) {
                            return res.status(404).json({ erro: true, message: "roleid " + req.body.roleid + " not exists" });
                        }
                        //////////////////////////////////////
                        let role;
                        await Role.find({
                            _id: { $in: req.body.roleid }
                        }).then(result => {
                            role = result[0].name;

                        });

                        const user = new User({

                            name: req.body.name,
                            email: req.body.email.toLowerCase(),
                            password: hash,
                            gender: req.body.gender.toLowerCase(),
                            isActive: req.body.isActive,
                            roleid: req.body.roleid,
                            role: role
                        });


                        const token = jwt.sign({
                            email: user.email,
                        }, process.env.TOKEN, { expiresIn: '6h' });

                        const userToken = new User({
                            name: req.body.name,
                            email: req.body.email.toLowerCase(),
                            password: hash,
                            gender: req.body.gender.toLowerCase(),
                            isActive: req.body.isActive,
                            roleid: req.body.roleid,
                            role: role,
                            token: token,

                        })


                        userToken.save().then(result => {

                            return res.status(201).json({ error: false, data: result })

                        }).catch(err => { return res.status(500).json({ error: true, message: err.message }) });


                    }
                })
            }
            else {
                return res.status(400).json({ error: true, message: 'user already exists' });
            }
        }
        ).catch(err => {

            return res.status(500).json({ error: true, message: err.message });
        });
    };



    updateUsers = (req, res) => {


        User.findOne({ _id: req.params.id },).then(async (data) => {

            if (data.roleid == 0 && !req.policies.includes("update_superadmin")) {



                return res.status(404).json({ error: true, message: "unauthorized access" });
            }
            if (data.roleid == 1 && !req.policies.includes("update_admin")) {



                return res.status(404).json({ error: true, message: "unauthorized access" });
            }
            if (data.roleid == 2 && !req.policies.includes("update_user")) {
                return res.status(404).json({ error: true, message: "unauthorized access" });
            }

            if (data == null) {
                res.status(404).json({ error: true, message: "user not exists" });

            }
            else {
                let name, email, gender, roleid, role;

                if (req.body.roleid != "") {

                    if (req.body.roleid == undefined) {
                        roleid = data.roleid;
                        role = data.role;
                    }
                    else {

                        var rolesIds = [];
                        await Role.find().then(result => {
                            for (let i = 0; i < result.length; i++) {
                                rolesIds.push(result[i]._id);
                            }
                        })

                        if (!rolesIds.includes(req.body.roleid)) {
                            return res.status(404).json({ erro: true, message: "roleid " + req.body.roleid + " not exists" });
                        }


                        roleid = req.body.roleid;
                        await Role.find({
                            _id: { $in: req.body.roleid }
                        }).then(result => {
                            role = result[0].name;

                        });



                    }


                }
                else {
                    return res.status(404).json({ error: true, message: "a user must have a role" });
                }

                if (req.body.name != "") {
                    name = req.body.name == undefined ? data.name : req.body.name;

                }
                else {
                    return res.status(400).json({ error: true, message: "name field can't be empty" });
                }
                if (req.body.email != "") {

                    if (req.body.email != undefined && req.body.email.toLowerCase() != data.email.toLowerCase()) {

                        return res.status(400).json({ error: true, message: "can't update email" });
                    }

                    email = req.body.email == undefined ? data.email : req.body.email.toLowerCase();

                }
                else {
                    return res.status(400).json({ error: true, message: "email field can't be empty" });
                }

                if (req.body.gender != "") {
                    gender = req.body.gender == undefined ? data.gender : req.body.gender;
                }
                else {
                    return res.status(400).json({ error: true, message: "gender field can't be empty" });
                }

                let answer = validations.updateUsersValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message });
                }
                User.updateOne(
                    { _id: req.params.id },
                    {
                        $set:
                        {
                            name: name,
                            email: email,
                            gender: gender,
                            roleid: roleid,
                            role: role,
                            token: data.token
                        }

                    },
                    { upsert: true }
                ).then(result => { return res.status(201).json({ error: false, data: { name, email, gender, roleid, role } }) });

            }
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ errror: true, message: "id must be in integer format " });
            console.log("faf");
            return res.status(500).json({ error: true, message: err })
        });
    };


    createSuperadmin = async (req, res,next) => {
        User.find().then(async (data) => {
            if (data != "") {
                console.log("not");
                next();
            }
             else {
            console.log("faf");
            var roleid = 0, role = "superadmin";
            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error: true, message: answer.error.details[0].message });
            }
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message })
                }
             //   else {
                    const user = new User({
                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,
                        roleid: roleid,
                        role: role
                    });


                    const token = jwt.sign({
                        email: user.email,
                    }, process.env.TOKEN, { expiresIn: '6h' });

                    const userToken = new User({
                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        roleid: roleid,
                        role: role,
                        isActive: req.body.isActive,
                        token: token,

                    })
                    // let id;
                    await userToken.save().then(result => {
                        // id = userToken._id;
                        // if (id != 0)
                        return res.status(201).json({ error: false, data: result })

                    }).catch(err => { return res.status(500).json({ error: true, message: err.message }) });
                   
                    var myPolicies = [
                        { name: "register_user", display_name: "registerUser", description: "register user" },
                        { name: "create_user", display_name: "createUser", description: "create user" },
                        { name: "update_user", display_name: "updateUser", description: "update user" },
                        { name: "delete_user", display_name: "deleteUser", description: "display user" },
                        { name: "update_password", display_name: "updatePassword", description: "update user Password" },
                        { name: "show_users", display_name: "showUsers", description: "show users" },
                        { name: "show_me", display_name: "showMe", description: "show me" },
                        { name: "update", display_name: "Update", description: "update" },
                        { name: "create_post", display_name: "createPost", description: "create post" },
                        { name: "update_post", display_name: "updatePost", description: "update post" },
                        { name: "show_post", display_name: "showPoste", description: "show post" },
                        { name: "delete_post", display_name: "deletPost", description: "display name" },
                        { name: "create_policy", display_name: "createPolicy", description: "create policy" },
                        { name: "update_policy", display_name: "updatePolicy", description: "update policy" },
                        { name: "show_policy", display_name: "showPolicy", description: "show policy" },
                        { name: "delete_policy", display_name: "deletePolicy", description: "delete policy" },
                        { name: "create_role", display_name: "createRole", description: "create role" },
                        { name: "update_role", display_name: "updatRole", description: "update role" },
                        { name: "show_role", display_name: "showRole", description: "show role" },
                        { name: "delete_role", display_name: "deleteRole", description: "delet role" },
                        { name: "create_superadmin", display_name: "createSuperadmin", description: "create superadmin" },
                        { name: "create_admin", display_name: "createAdmin", description: "create admin" },
                        { name: "update_admin", display_name: "updateAdmin", description: "update admin" },
                    ];

                    Policy.create(myPolicies, function (err, policy) {
                        if (err) return res.status(500).json({ error: true, message: err.message });

                    });
                    var myRole = { name: process.env.ROLE, display_name: "superAdmin", policyid: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], policies: ["register_user", "create_user", "update_user", "delete_user", "update_password", "show_users", "show_me", "update", "create_post", "update_post", "show_post", "delete_post", "create_policy", "update_policy", "show_policy", "delete_policy", "create_role", "update_role", "show_role", "delete_role", "create_superadmin", "create_admin", "update_admin"] }
                    Role.create(myRole, function (err, role) {
                        if (err) return res.status(500).json({ error: true, message: err.message });

                    });

                    // }
                    //      }


             //   }
            })

        }
        })
        
    }


  
register = async (req, res) => {
    User.findOne({ email: req.body.email }).then (async(data) => {
        if (data == null) {
           
            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error:true,message: answer.error.details[0].message });
            }
            bcrypt.hash(req.body.password, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message })
                }
                else {
                    const user = new User({
                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,
                    });


                    const token = jwt.sign({
                        email: user.email,
                    }, process.env.TOKEN, { expiresIn: '6h' });

                    const userToken = new User({
                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,
                        token: token,

                    })
                 
                   await userToken.save().then(result => {
                        return res.status(201).json({ error: false, data: result })

                    }).catch(err => { return res.status(500).json({ error: true, message: err.message }) });
               
                    
          
                }
            })
        }
        else {
            return res.status(400).json({ error:true,message: 'user already exists' });
        }
    }
    ).catch(err => {

        return res.status(500).json({ error:true,message: err.message });
    });
};


login = (req, res) => {

    User.find({ email: req.body.email }).then(user => {
        let answer = validations.loginValidations.validate(req.body);
        if (answer.error) {
            return res.status(400).json({error:true, message: answer.error.details[0].message });
        }

        if (user.length == 0) {
            return res.status(401).json({ error:true,message: 'no user with this email' });
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (!result) {
                return res.status(401).json({ error:true,message: 'password matching fail' });
            }
            if (result) {

                const token = jwt.sign({ email: user[0].email }, process.env.TOKEN, { expiresIn: '6h' });

                User.updateOne({ email: req.body.email.toLowerCase() },
                    {
                        $set:
                        {
                            token: token,
                        }
                    },
                    { upsert: true }).then(result => {
                        res.status(201).json({
                            error: false, data: {
                                name: user[0].name,
                                email: user[0].email,
                                gender: user[0].gender,
                                token: token
                            }
                        })
                    });
            }
        })
    }).catch(err => {
        console.log("dfaf");
        return res.status(500).json({ error:true,message: err.message });
    });
};



logout = function (req, res) {

    User.findOne({ email: req.isemail }).then((data) => {
        if (data['token'] == "") {
            res.status(401).json({ error:true,message: "already logged out" });
        }
        else {

            User.updateOne({ email: data.email }, { $set: { token: "" } }, { upsert: true }
            ).then(result => {
                return res.status(200).json({ error:false,message: "logged out" })
            }
            );
        }
    }).catch(err => { return res.status(500).json({ error:true,message: err }); });

};
}

module.exports =  authControllers ;
