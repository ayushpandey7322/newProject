const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Token } = require('../model/tokenSchema');

class userAuth {



    rolesAuth = async (req, res, next) => {



        console.log("adf");
        var roleid, role, policies = [];
        await User.find({
            email: { $in: req.isemail }
        }).then(async result => {
            if (result == "") {
                console.log("result", result);
                return res.status(404).json({ error: true, message: " user not exists", data: {} });

            }
            if (result[0].isActive == "false")
                return res.status(401).json({ error: true, message: " user has been deleted", data: {} });
             roleid = result[0].roleid;
             role=result[0].role;
            console.log("roleid", roleid);

            await Role.findOne({ _id: roleid }).then(result => {
                console.log(result);
                if (result == null) {
                    return res.status(404).json({ error: true, message: "role not exists", data: {}});
                }

                const policies = result.policies;
                req.policies = policies;
                next();


            }).catch(err => {

                return res.status(500).json({ error: true, message: err.message, data: {}});
            });
        }).catch(err => {

            return res.status(500).json({ error: true, message: err.message, data: {}});
        });
    
       
    }





    personalAuth = (req, res, next) => {                  
        User.findOne({ _id: req.params.id }).then((data) => {
            if (data == null) {
                return res.status(404).json({ error: true, message: "user not exists", data: {} });
            }
          

                const token = req.headers.authorization.split(" ")[1];  
                const verify = jwt.verify(token, process.env.TOKEN);
                
                if (verify.email == data.email) {

                    req.isemail = verify.email;
                    next();
                }
                else {
                    return res.status(401).json({ error: true, message: "not a verified user", data: {}});//  throw new Error("not a verified user");
                }
            
        }).catch(error => {
                if (error.name != "TokenExpiredError") {
                    return res.status(401).json({ error: true, message: "invalid token", data: {} });
                }
                else {
                    return res.status(401).json({ error: true, message: error.message, data: {} });
                }
            });
    }
    

    verifyToken = (req, res, next) => {    
        console.log("a");
        try {
            const token = req.headers.authorization.split(" ")[1];  
            const verify = jwt.verify(token, process.env.TOKEN);
            Token.findOne({ token: token }).then(result => {
                if (result == null)
                    return res.status(404).json({ error: true, message: "user not exists", data: {} });
                if (result.status == "loggedOut")
                    return res.status(401).json({ error: true, message: "logged out user", data: {} });
                if (result.status == "blacklisted")
                    return res.status(401).json({ error: true, message: "Blacklisted user", data: {} });
                req.isemail = verify.email;
                req.token = result;
                next();
            })
            //if (verify.email) {
            //    req.isemail = verify.email;
            //    req.token = token;
            //    next();
            //} else {
            //    return res.status(404).json({ error: true, message: "user not exist", data: {} });

            //}
          
        } catch (error) {
           
            if (error.name != "TokenExpiredError") {
                return res.status(401).json({ error: true, message: "invalid token", data: {}});
            }
            else {
                return res.status(401).json({ error: true, message: error.message, data: {}});
            }
        }

    }





    
    /*
    logedinUser = (req, res, next) => {
        console.log("ffks");
        User.findOne({ email: req.isemail },).then((data) => {
            if (data == null) {
                return res.status(404).json({ error:true,message: "user not found", data: {} });
            }
            else {
                if (data['token'] == "") {
                    return res.status(401).json({ error: true, message: "user already logged out", data: {} });
                }
                else {
                    next();
                }
            }
        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message, data: {}});
        });
    }
    */


}
module.exports = { userAuth };