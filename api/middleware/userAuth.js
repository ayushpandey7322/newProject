const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const { Policy } = require('../model/policySchema');
class userAuth {



    rolesAuth = async (req, res,next) => {
        var roleid, policies = [];
        await User.find({
            email: { $in: req.isemail }
        }).then(result => {
            if(result==""){
                return res.status(404).json({error:true,message:" user not exists"});
            }
            const roleid = result[0].roleid;
            const role=result[0].role;
            //console.log(roleid);
        }).catch(err => {

            return res.status(500).json({ error:true,message: err.message });
        });
        await Role.find ({
            _id: { $in: roleid }
        }).then(result => {
            console.log(result);
            if(result==""){
                return res.status(404).json({error:true,message:"role not exists"});
            }
           
            const policies = result[0].policies;
            req.policies = policies;
            next();
    
            
        }).catch(err => {

            return res.status(500).json({ error:true,message: err.message });
        });
       
    }




    auth = (req, res, next) => {
       
        try {
              const   token = req.headers.authorization.split(" ")[1];  
              
                const verify = jwt.verify(token, process.env.TOKEN);
              
                if (verify.email == "ayush@gmail.com") {
                    next();
                } else {
                    return res.status(401).json({ error:true,message: "not admin" })
                }
           
        } catch (error) {
       
            if (error.name != "TokenExpiredError") {
                return res.status(401).json({ error:true,message: "invalid token" });  
            }
            else {
                return res.status(401).json({ error:true,message: error.message });
            }
        }
    }

    personalAuth = (req, res, next) => {                  
        User.findOne({ _id: req.params.id }).then((data) => {
            if (data == null) {
                return res.status(404).json({ error:true,message: "not a valid id/ user not exist" });
            }
            else {

                const token = req.headers.authorization.split(" ")[1];  
                const verify = jwt.verify(token, process.env.TOKEN);
                
                if (verify.email == data.email) {

                    req.isemail = verify.email;
                    next();
                }
                else {
                    return res.status(401).json({error:true,message:"not a verified user"});//  throw new Error("not a verified user");
                }
            }
        }).catch(error => {
                if (error.name != "TokenExpiredError") {
                    return res.status(401).json({ error:true,message: "invalid token" });
                }
                else {
                    return res.status(401).json({ error:true,message: error.message });
                }
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
                return res.status(404).json({ error:true,message: "user not exist" })
            }
          
        } catch (error) {
           
            if (error.name != "TokenExpiredError") {
                return res.status(401).json({ error:true,message: "invalid token" });
            }
            else {
                return res.status(401).json({ error:true,message :error.message });
            }
        }

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
module.exports = { userAuth };