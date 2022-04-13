const { Policy } = require('../model/policySchema');
require('dotenv').config();
const policyValidations = require('../validations/policyValidation');
const validations = new policyValidations;

class policyControllers {
    store = (req, res) => {
        if (!req.policies.includes("create_policy")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        Policy.findOne({ name: req.body.name }).then ((data) => {
            if (data != null) {
                return res.status(404).json({ error:true,message: 'policy exist' });
            }
                let answer = validations.storeValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error:true,message: answer.error.details[0].message });
                }
                const policy = new Policy({
                    name: req.body.name,
                    display_name: req.body.display_name,
                    description: req.body.description
                });
                policy.save().then(result => {

                    return res.status(201).json({ error:false,data: result })

                }).catch(err => { return res.status(500).json({ error:true,message: err.message }) });
            
           
        }).catch(err => {

            return res.status(500).json({ error:true,message: err.message });
        });
    }


    index = (req, res, next) => {
        if (!req.policies.includes("show_policy")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
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

                return res.status(404).json({ error:true,message: "no policy with such query" });
            }
            return res.json({ error:false,data: data });
        }).catch(err => {
            return res.status(500).json({ error:true,message: err.message });
        });


    }





    show = (req, res) => {
        if (!req.policies.includes("show_policy")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        Policy.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error:true,message: " policy doesn't exist" });
            }
            return res.status(200).json({error:false,data: result });


        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ msg: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err.message });
        });
    }


    destroy = (req, res) => {
        if (!req.policies.includes("delete_policy")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        Policy.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error:true,message: "policy doesn't exist" });
            }


                let isActive = result['isActive'] = false;

                Policy.updateOne({ _id: req.params.id }, {
                    $set: {
                        isActive: isActive
                    }
                },
                    { upsert: true }).then(result => { return res.status(200).json({ error:false,message: "successfully deleted" }); });

            

        }).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error:true,message: "id must be in integer format " });
            return res.status(500).json({ error: true, message: err.message });
            });
    }


    update = (req, res) => {   
        if (!req.policies.includes("update_policy")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        Policy.findOne({ _id: req.params.id }).then((data) => {
            console.log("hhh");

            if (data == null) {

               return  res.status(400).json({ error:true,message: "policy doesn't exist" });

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

                        return res.status(400).json({ error:true,message: "can't update name of a policy" });
                    }
        
                    name = req.body.name == undefined ? data.name : req.body.name.toLowerCase();
              
                }
                else {
                    return res.status(400).json({ error: true,message: "name field can't be empty" });
                }

                if (req.body.display_name != "") {
                    display_name = req.body.display_name == undefined ? data.display_name : req.body.display_name;
                }
                else {
                    return res.status(400).json({ error:true,message: "display_name field can't be empty" });
                }

            console.log("dfa");

                let answer = validations.updateValidations.validate(req.body);

                if (answer.error) {
                    return res.status(400).json({ error:true,message: answer.error.details[0].message });
                }
            console.log("faf");

                
                Policy.updateOne({ _id: req.params.id }, {
                    $set: {
                        name: name,
                        description: description,
                     
                        display_name: display_name
                    }

                },
                    { upsert: true }).then(result => { return res.status(200).json({ error:false,data: {name,description,display_name} }) });

            
 
        }

        ).catch(err => {
            console.log("afa");
            if (err.name == 'CastError')
                return res.status(404).json({ error:true,message: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err.message })
        });
    };
}
module.exports = policyControllers ;