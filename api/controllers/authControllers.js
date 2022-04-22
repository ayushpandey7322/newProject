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
            if (data != null) {
                return res.status(400).json({ error: true, message: 'user already exists', data: {} });
            }
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
                        await Role.find().then (async result => {
                            for (let i = 0; i < result.length; i++) {
                                rolesIds.push(result[i]._id);
                            }

                            if (!rolesIds.includes(req.body.roleid)) {
                                return res.status(404).json({ error: true, message: "roleid " + req.body.roleid + " not exists", data: {} });
                            }

                            let role;
                            await Role.find ({
                                _id: { $in: req.body.roleid }
                            }).then (async result => {
                                if (result[0].isActive != true)
                                    return res.status(404).json({ error: true, message: "role has been deleted", data: {} });
                                console.log("superadmin",result);
                                role = result[0].name;

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

                                console.log(token);

                                await user.save().then (result => {

                                    return res.status(201).json({ error: false, message: "new user created", data: result, token })

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
                                    
                                })
                                

                                await newToken.save().catch(err => {

                                    return res.status(500).json({ error: true, message: err.message, data: {} });
                                });
                            });

                        })




                    }
                })
            //}
            //else {
            //    return res.status(400).json({ error: true, message: 'user already exists', data: {}});
            //}
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
                            if (result[0].isActive==true)
                            role = result[0].name;
                            console.log(role);
                        });
                        console.log(role);
                        if (role == undefined)
                            return res.status(400).json({message: "role has been deleted"});

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
                        {_id:0, name: "register_user", display_name: "registerUser", description: "register user" },
                        {_id:1, name: "create_user", display_name: "createUser", description: "create user" },
                        { _id:2,name: "update_user", display_name: "updateUser", description: "update user" },
                        { _id:3,name: "delete_user", display_name: "deleteUser", description: "display user" },
                        { _id:4,name: "update_password", display_name: "updatePassword", description: "update user Password" },
                        { _id:5,name: "show_users", display_name: "showUsers", description: "show users" },
                        {_id:6, name: "show_me", display_name: "showMe", description: "show me" },
                        { _id:7,name: "update", display_name: "Update", description: "update" },
                        { _id:8,name: "create_post", display_name: "createPost", description: "create post" },
                        { _id:9,name: "update_post", display_name: "updatePost", description: "update post" },
                        { _id:10,name: "show_post", display_name: "showPoste", description: "show post" },
                        { _id:11,name: "delete_post", display_name: "deletPost", description: "display name" },
                        { _id:12,name: "create_policy", display_name: "createPolicy", description: "create policy" },
                        { _id:13,name: "update_policy", display_name: "updatePolicy", description: "update policy" },
                        { _id:14,name: "show_policy", display_name: "showPolicy", description: "show policy" },
                        { _id:15,name: "delete_policy", display_name: "deletePolicy", description: "delete policy" },
                        { _id:16,name: "create_role", display_name: "createRole", description: "create role" },
                        { _id:17,name: "update_role", display_name: "updatRole", description: "update role" },
                        { _id:18,name: "show_role", display_name: "showRole", description: "show role" },
                        {_id:19, name: "delete_role", display_name: "deleteRole", description: "delet role" },
                        { _id:20,name: "create_superadmin", display_name: "createSuperadmin", description: "create superadmin" },
                        { _id:21,name: "create_admin", display_name: "createAdmin", description: "create admin" },
                        {_id:22, name: "update_admin", display_name: "updateAdmin", description: "update admin" },
                    ];

                   await Policy.create(myPolicies, function (err, policy) {
                        if (err) return res.status(500).json({ error: true, message: err.message, data: {} });

                    });
                var myRole = { _id:0,name: "superadmin", display_name: "superAdmin", policyid: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], policies: ["register_user", "create_user", "update_user", "delete_user", "update_password", "show_users", "show_me", "update", "create_post", "update_post", "show_post", "delete_post", "create_policy", "update_policy", "show_policy", "delete_policy", "create_role", "update_role", "show_role", "delete_role", "create_superadmin", "create_admin", "update_admin"] };
                 await   Role.create(myRole, function (err, role) {
                        if (err) return res.status(500).json({ error: true, message: err.message, data: {} });

                    });
                var adminRole = {_id:1, name: "admin", display_name: "Admin", policyid: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,21], policies: ["register_user", "create_user", "update_user", "delete_user", "update_password", "show_users", "show_me", "update", "create_post", "update_post", "show_post", "delete_post", "create_policy", "update_policy", "show_policy", "delete_policy", "create_admin"] };
               await Role.create(adminRole, function (err, role) {
                    if (err) return res.status(500).json({ error: true, message: err.message, data: {}});

                });
                var userRole = { _id:2,name: "user", display_name: "User", policyid: [0, 1,4, 6, 7, 8, 9, 10, 11], policies: ["register_user", "create_user",  "update_password", "show_me", "update", "create_post", "update_post", "show_post", "delete_post" ] };
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
                        //expiryTime: (Date.now() / 1000 +86400)*1000
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
