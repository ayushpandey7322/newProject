const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
class postAuth {
    rolesAuth = async (req, res,next) => {
        var roleid, policies = [];
        await User.find({
            email: { $in: req.isemail }
        }).then(result => {
            roleid = result[0].roleid;
        })

        await Role.find({
            _id: { $in: roleid }
        }).then(result => {
            policies = result[0].policies;
        })
        req.policies = policies;
        next();

    }

    verifyToken = (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const verify = jwt.verify(token, process.env.TOKEN);
            if (verify.email) {
                req.isemail = verify.email;
                next();
            } else {
                return res.status(404).json({ error: true, message: "user not exist" })
            }

        } catch (error) {

            if (error.name != "TokenExpiredError") {
                return res.status(401).json({ error: true, message: "invalid token" });
            }
            else {
                return res.status(401).json({ error: true, message: error.message });
            }
        }

    }

    auth = (req, res, next) => {
        async function f() {
            try {
                let isemail;
                const token = req.headers.authorization.split(" ")[1];   
                const verify = jwt.verify(token, process.env.TOKEN);
               await User.findOne({ email: verify.email }).then((data) => {
                   if (data['token'] == "") {
                        return res.status(401).json({ error:true,message: "already logged out" });
                    }
                    else {
                        req.isemail = verify.email;
                        isemail = data.email;
                        req.isid = data._id;
                    }
               }).catch(err => {
                   return res.status(500).json({ eror:true,message: err.message });
               });
            
                if (verify.email == isemail) {                                                                           
                    next();
                } else { 
                    
                    return res.status(401).json({ error:true,messsage: "not a verified user  " });
                }
            } catch (error) {
          
                if (error.name != "TokenExpiredError") {
                    return res.status(401).json({ error:true,message: "invalid token" });  
                }
                else {
                    return res.status(401).json({ error:true,message: error.message });
                }
            }
        } f();
    }

}
module.exports = { postAuth };