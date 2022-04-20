const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Policy } = require('../model/policySchema');
const { Token } = require('../model/tokenSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authControllersValidation = require('../validations/authControllersValidation');
const validations = new authControllersValidation;


class authControllers {
    createUsers = async (req, res) => {

        if (req.body.roleid == 0 && !req.token.policies.includes("create_superadmin")) {

            return res.status(401).json({ error: true, message: "unauthorized access" ,data: {} });
        }
        if (req.body.roleid == 1 && !req.token.policies.includes("create_admin")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        if (req.body.roleid == 2 && !req.token.policies.includes("create_user")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        User.findOne({ email: req.body.email }).then(async (data) => {
            if (data == null) {

                let answer = validations.createUsersValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {}});
                }
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: true, message: err.message, data: {} })
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
                            return res.status(404).json({ erro: true, message: "roleid " + req.body.roleid + " not exists", data: {}});
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
                        }, process.env.TOKEN, { expiresIn: '1d' });

                       


                        user.save().then(result => {

                            return res.status(201).json({ error: false,message:"new user created", data: result,token })

                        }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }) });

                        let policyid, policies;
                        await Role.find({
                            _id: { $in: user.roleid }
                        }).then(
                            result => {
                                policyid = result[0].policyid;
                                policies = result[0].policies;
                            })

                        const newToken = new Token({
                            token: token,
                            status: "active",
                            userid: user._id,
                            policyid: policyid,
                            policies: policies,
                            expiryTime: (Date.now() / 1000 + 86400) * 1000
                        })
                       
                        await newToken.save().catch(err => {

                            return res.status(500).json({ error: true, message: err.message, data: {} });
                        });


                    }
                })
            }
            else {
                return res.status(400).json({ error: true, message: 'user already exists', data: {}});
            }
        }
        ).catch(err => {

            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    };



    updateUsers = (req, res) => {


        User.findOne({ _id: req.params.id },).then(async (data) => {

            if (data.roleid == 0 && !req.token.policies.includes("update_superadmin")) {



                return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
            }
            if (data.roleid == 1 && !req.token.policies.includes("update_admin")) {



                return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
            }
            if (data.roleid == 2 && !req.token.policies.includes("update_user")) {
                return res.status(401).json({ error: true, message: "unauthorized access", data:{} });
            }

            if (data == null) {
                res.status(404).json({ error: true, message: "user not exists", data: {} });

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
                            return res.status(404).json({ error: true, message: "roleid " + req.body.roleid + " not exists", data: {}});
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
                    return res.status(404).json({ error: true, message: "a user must have a role", data: {}});
                }

                if (req.body.name != "") {
                    name = req.body.name == undefined ? data.name : req.body.name;

                }
                else {
                    return res.status(400).json({ error: true, message: "name field can't be empty", data: {}});
                }
                if (req.body.email != "") {

                    if (req.body.email != undefined && req.body.email.toLowerCase() != data.email.toLowerCase()) {

                        return res.status(400).json({ error: true, message: "can't update email", data: {}});
                    }

                    email = req.body.email == undefined ? data.email : req.body.email.toLowerCase();

                }
                else {
                    return res.status(400).json({ error: true, message: "email field can't be empty", data: {} });
                }

                if (req.body.gender != "") {
                    gender = req.body.gender == undefined ? data.gender : req.body.gender;
                }
                else {
                    return res.status(400).json({ error: true, message: "gender field can't be empty", data: {} });
                }

                let answer = validations.updateUsersValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {}});
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
                           
                        }

                    },
                    { upsert: true }
                ).then(result => { return res.status(201).json({ error: false,message:"updated data of user", data: { name, email, gender, roleid, role } }) });

            }
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ errror: true, message: "id must be in integer format ", data: {} });
            console.log("faf");
            return res.status(500).json({ error: true, message: err.message, data: {} })
        });
    };


    createSuperAdmin = async (req, res,next) => {
        User.find().then (async (data) => {
            if (data != "") {
            
                next();
            }
             else {
           
            var roleid = 0, role = "superadmin";
            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
            }
            bcrypt.hash(req.body.password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message, data: {} })
                }
    
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
                    }, process.env.TOKEN, { expiresIn: '1d' });

              

                    await user.save().then(result => {
                       
                        return res.status(201).json({ error: false,message:"super admin created", data: result,token })

                    }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }) });




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

                   await Policy.create(myPolicies, function (err, policy) {
                        if (err) return res.status(500).json({ error: true, message: err.message, data: {} });

                    });
                var myRole = { name: process.env.ROLE, display_name: "superAdmin", policyid: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], policies: ["register_user", "create_user", "update_user", "delete_user", "update_password", "show_users", "show_me", "update", "create_post", "update_post", "show_post", "delete_post", "create_policy", "update_policy", "show_policy", "delete_policy", "create_role", "update_role", "show_role", "delete_role", "create_superadmin", "create_admin", "update_admin"] };
                 await   Role.create(myRole, function (err, role) {
                        if (err) return res.status(500).json({ error: true, message: err.message, data: {} });

                    });
                var adminRole = { name: "admin", display_name: "Admin", policyid: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,21], policies: ["register_user", "create_user", "update_user", "delete_user", "update_password", "show_users", "show_me", "update", "create_post", "update_post", "show_post", "delete_post", "create_policy", "update_policy", "show_policy", "delete_policy", "create_admin"] };
               await Role.create(adminRole, function (err, role) {
                    if (err) return res.status(500).json({ error: true, message: err.message, data: {}});

                });
                var userRole = { name: "user", display_name: "User", policyid: [0, 1,4, 6, 7, 8, 9, 10, 11], policies: ["register_user", "create_user",  "update_password", "show_me", "update", "create_post", "update_post", "show_post", "delete_post" ] };
               await Role.create(userRole, function (err, role) {
                    if (err) return res.status(500).json({ error: true, message: err.message, data: {} });

               });


                const newToken = new Token({
                    token: token,
                    status: "active",
                    userid: user._id,
                    policyid: myRole.policyid,
                    policies: myRole.policies,
                    expiryTime: (Date.now() / 1000 + 86400) * 1000
                })
                await newToken.save().catch(err => {

                    return res.status(500).json({ error: true, message: err.message, data: {} });
                });
                
                



            })

        }
        }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }) });
        
    }


  
register = async (req, res) => {
    User.findOne({ email: req.body.email }).then (async(data) => {
        if (data == null) {
           
            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
            }
            bcrypt.hash(req.body.password, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message, data: {}})
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
                    }, process.env.TOKEN, { expiresIn: '1d' });
                  
      
                 
                    await user.save().then(result => {
                 
                        return res.status(201).json({ error: false, message: "new user created", data: result,token });

                   }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }) });

                    let policyid, policies;
                    await Role.find({
                        _id: { $in: user.roleid }
                    }).then(
                        result => {
                            policyid = result[0].policyid;
                            policies = result[0].policies;})

                    const newToken = new Token({
                        token: token,
                        status: "active",
                        userid: user._id,
                        policyid: policyid,
                        policies: policies,
                        expiryTime: (Date.now() / 1000 +86400)*1000
                    })
                    console.log(newToken);
                    await newToken.save().catch(err => {

                        return res.status(500).json({ error: true, message: err.message, data: {} });
                    });
          
                }
            })
        }
        else {
            return res.status(400).json({ error: true, message: 'user already exists', data: {}});
        }
    }
    ).catch(err => {

        return res.status(500).json({ error: true, message: err.message, data: {} });
    });
};


login = async(req, res) => {

    await User.find({ email: req.body.email }).then(async user => {
        let answer = validations.loginValidations.validate(req.body);
        if (answer.error) {
            return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
        }

        if (user.length == 0) {
            return res.status(401).json({ error: true, message: 'no user with this email', data: {} });
        }

        bcrypt.compare(req.body.password, user[0].password, async(err, result) => {
            if (!result) {
                return res.status(401).json({ error: true, message: 'password matching fail', data: {} });
            }
            if (result) {

                const token = jwt.sign({ email: user[0].email }, process.env.TOKEN, { expiresIn: '1d' });

                await User.updateOne({ email: req.body.email.toLowerCase() },
                    {
                        $set:
                        {
                            token: token,
                        }
                    },
                    { upsert: true }).then(result => {
                        return res.status(201).json({ error: false, message: "successfully login", data: user[0], token: token})
                    });

                let policyid, policies;
                await Role.find({
                    _id: { $in: user[0].roleid }
                }).then(
                    result => {
                        policyid = result[0].policyid;
                        policies = result[0].policies;
                    })

                const newToken = new Token({
                    token: token,
                    status: "active",
                    userid: user[0]._id,
                    policyid: policyid,
                    policies: policies,
                    expiryTime: (Date.now() / 1000 + 86400) * 1000
                })
                await newToken.save().catch(err => {

                    return res.status(500).json({ error: true, message: err.message, data: {} });
                });

            }
        })
    }).catch(err => {
        console.log("dfaf");
        return res.status(500).json({ error: true, message: err.message, data: {} });
    });
};



    logout = function (req, res) {
        Token.findOne({ token: req.token }).then((data) => {
            if (data == null)
                return res.status(404).json({ error: true, message: "user not exists", data: {} });
            if (data.status == "loggedOut") 
                return res.status(401).json({ error: true, message: "user has been already logged out", data: {} });
            if (data.status == "blacklisted") 
                return res.status(401).json({ error: true, message: "Blacklisted user", data: {} });
            data.status = "loggedOut";
            data.save().then(result => {
                return res.status(200).json({ error: false, message: "successfully logged out", data: {} })
            })
        }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }); });


        /*

    User.findOne({ email: req.isemail }).then((data) => {
        if (data == null)
            res.status(404).json({ error: true, message: "user not exists", data: {} });
        if (data['token'] == "") {
            res.status(401).json({ error: true, message: "already logged out", data: {} });
        }
        else {

            User.updateOne({ email: data.email }, { $set: { token: "" } }, { upsert: true }
            ).then(result => {
                return res.status(200).json({ error: false, message: "logged out", data: {}  })
            }
            );
        }
    }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {} }); });
    */
    };

}

module.exports =  authControllers ;
