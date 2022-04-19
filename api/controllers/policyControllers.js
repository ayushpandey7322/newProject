const { Policy } = require('../model/policySchema');
const { Role } = require('../model/rolesSchema');
require('dotenv').config();
const policyValidations = require('../validations/policyValidation');
const validations = new policyValidations;

class policyControllers {
    store = async (req, res) => {
        
        if (!req.token.policies.includes("create_policy")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        await Policy.findOne({ name: req.body.name }).then (async(data) => {
            if (data != null) {
                return res.status(404).json({ error: true, message: 'policy exist', data: {} });
            }
                let answer = validations.storeValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
                }
                const policy = new Policy({
                    name: req.body.name,
                    display_name: req.body.display_name,
                    description: req.body.description
                });
            let id,name;
               await policy.save().then(result => {
                  id = policy._id;
                  name = policy.name;
                    return res.status(201).json({ error:false,message:"new policy created",data: result })

               }).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {}}) });
            await Role.findOne({ role: "superadmin" }).then(data => {
                if (data == null)
                    res.status(404).json({ error: true, message: "role not exists", data: {} });
                data.policyid.push(id);
                data.policies.push(name);
                data.save();
              
            })
           
        }).catch(err => {

            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    }


    index = (req, res, next) => {
        if (!req.token.policies.includes("show_policy")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        let keys = Object.keys(req.query);
        let filters = new Object();

        if (keys.includes("name")) {

            filters.name = { $regex: req.query["name"], $options: "i" };
        }
        if (keys.includes("diplay_name")) {
            filters.display_name = { $regex: req.query["display_name"], $options: "i" };
        }
        if (keys.includes("description")) {
            filters.description = { $regex: req.query["description"], $options: "i" };
        }
        


        Policy.find(filters).then(data => {

            if (data.length == 0) {

                return res.status(404).json({ error:false,message: "no policy with such query",data:data });
            }
            return res.json({ error:false,message:"policies data",data: data });
        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });


    }





    show = (req, res) => {
        if (!req.token.policies.includes("show_policy")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Policy.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: " policy doesn't exist", data: {} });
            }
            return res.status(200).json({error:false,message:"polcies data",  data: result });

            
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ msg: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    }


    destroy = (req, res) => {
        if (!req.token.policies.includes("delete_policy")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Policy.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: "policy doesn't exist", data: {}});
            }


                let isActive = result['isActive'] = false;

                Policy.updateOne({ _id: req.params.id }, {
                    $set: {
                        isActive: isActive
                    }
                },
                    { upsert: true }).then(result => { return res.status(200).json({ error: false, message: "successfully deleted", data: {} }); });

            

        }).catch(err => {
            if (err.name == 'CastError') {
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            }
            return res.status(500).json({ error: true, message: err.message, data: {} });
            });
    }


    update = (req, res) => {   
        if (!req.token.policies.includes("update_policy")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        Policy.findOne({ _id: req.params.id }).then((data) => {
            console.log("hhh");

            if (data == null) {

                return res.status(400).json({ error: true, message: "policy doesn't exist", data: {}});

            } 
            console.log("jjj");
                let name, description, display_name;

                if (req.body.description != "") {
                    description = req.body.description == undefined ? data.description : req.body.description;
                }
               // else {
               //     return res.status(404).json({ msg: "description field can't be empty" });
              //  }
            console.log("uuuu");
                if (req.body.name != "") {

                    if (req.body.name != undefined && req.body.name.toLowerCase() != data.name.toLowerCase()) {

                        return res.status(400).json({ error: true, message: "can't update name of a policy", data: {} });
                    }
        
                    name = req.body.name == undefined ? data.name : req.body.name.toLowerCase();
              
                }
                else {
                    return res.status(400).json({ error: true, message: "name field can't be empty", data: {} });
                }

                if (req.body.display_name != "") {
                    display_name = req.body.display_name == undefined ? data.display_name : req.body.display_name;
                }
                else {
                    return res.status(400).json({ error: true, message: "display_name field can't be empty", data: {} });
                }

            console.log("dfa");

                let answer = validations.updateValidations.validate(req.body);

                if (answer.error) {
                    return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
                }
            console.log("faf");

                
                Policy.updateOne({ _id: req.params.id }, {
                    $set: {
                        name: name,
                        description: description,
                     
                        display_name: display_name
                    }

                },
                    { upsert: true }).then(result => { return res.status(200).json({ error: false, message:"updated policy",data: {name,description,display_name} }) });

            
 
        }

        ).catch(err => {
            console.log("afa");
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} })
        });
    };
}
module.exports = policyControllers ;