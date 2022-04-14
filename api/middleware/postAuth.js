const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
class postAuth {
    
    rolesAuth = async (req, res,next) => {
        var roleid, role, policies = [];
        await User.find({
            email: { $in: req.isemail }
        }).then(result => {
            if(result==""){
                return res.status(404).json({error:true,message:" user not exists"});
            }
           // console.log(result);
             roleid = result[0].roleid;
             role=result[0].role;
          //  console.log(roleid);
        }).catch(err => {

            return res.status(500).json({ error:true,message: err.message });
        });
       // await Role.find().then(result=>{console.log(result);})
      //  console.log(roleid);
        await Role.findOne ({_id:roleid }).then(result => {
            console.log(result);
            if(result==null){
                return res.status(404).json({error:true,message:"role not exists"});
            }
           
            const policies = result.policies;
            req.policies = policies;
            next();
    
            
        }).catch(err => {

            return res.status(500).json({ error:true,message: err.message });
        });
       
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

    
    logedinUser = (req, res, next) => {
        User.findOne({ email: req.isemail },).then((data) => {
            if (data == null) {
                return res.status(404).json({ msg: "user not found" });
            }
            else {
                if (data['token'] == "") {
                    return res.status(401).json({ msg: "not a valid user / logged out" });
                }
                else {
                    next();
                }
            }
        }).catch(err => {
            return res.status(500).json({ msg: err.message });
        });
    }
    


}
module.exports = { postAuth };