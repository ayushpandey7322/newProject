const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Token } = require('../model/tokenSchema');
class postAuth {
    
    rolesAuth = async (req, res,next) => {
        var roleid, role, policies = [];
        await User.find({
            email: { $in: req.isemail }
        }).then(async result => {

            if(result==""){
                return res.status(404).json({ error: true, message: " user not exists", data: {}});

            }
            console.log(result[0].isActive);
            if (result[0].isActive == "false")
                return res.status(401).json({ error: true, message: " user has been deleted", data: {} });
             roleid = result[0].roleid;
            role = result[0].role;

            await Role.findOne({ _id: roleid }).then( result => {
                // console.log(result);
                if (result == null) {
                    return res.status(404).json({ error: true, message: "role not exists", data: {} });
                }

                const policies = result.policies;
                req.policies = policies;
                next();


            }).catch(err => {

                return res.status(500).json({ error: true, message: err.message, data: {} });
            });
         
        }).catch(err => {

            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
      

       
    }

    verifyToken = (req, res, next) => {
        console.log("a");
        try {
            const token = req.headers.authorization.split(" ")[1];
            const verify = jwt.verify(token, process.env.TOKEN);
            console.log(token);
            Token.findOne({ token: token }).then(result => {
                console.log(result);
                if (result == null)
                    return res.status(404).json({ error: true, message: "user not exists", data: {} });
                if (result.status == "loggedOut")
                    return res.status(401).json({ error: true, message: "logged out user", data: {} });
                if (result.status == "blacklisted")
                    return res.status(401).json({ error: true, message: "Blacklisted user", data: {} });
                req.isemail = verify.email;
                req.token = result;
                console.log(result);
                next();
            })

        } catch (error) {

            if (error.name != "TokenExpiredError") {
                return res.status(401).json({ error: true, message: "invalid token", data: {} });
            }
            else {
                return res.status(401).json({ error: true, message: error.message, data: {} });
            }
        }

    }

    auth = async(req, res, next) => {
                let isemail;
          
                await User.findOne({ email: req.isemail }).then((data) => {
                    if (data == null)
                        return res.status(401).json({ error: true, message: "user not exists", data: {} });
 
                        isemail = data.email;
                       req.isid = data._id;
                       req.isActive = data.isActive;
                    if ( req.isemail == isemail) {
                        next();
                    } else {

                        return res.status(401).json({ error: true, messsage: "not a verified user  ", data: {} });
                    }
               }).catch(err => {
                   return res.status(500).json({ eror: true, message: err.message, data: {} });
               });

    }

    


}
module.exports = { postAuth };