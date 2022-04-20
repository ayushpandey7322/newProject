const { Role } = require('../model/rolesSchema');
const { Policy } = require('../model/policySchema');
require('dotenv').config();
const rolesValidations = require('../validations/rolesValidation');
const validations = new rolesValidations;



class rolesControllers {
    store = async (req, res) => {
        if (!req.token.policies.includes("create_role")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Role.findOne({ name: req.body.name }).then(async (data) => {
            if (data != null) {
                return res.status(400).json({ error: true, message: "role exists", data: {} });
            }
            
            let answer = validations.storeValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
            }

            
            var policyNames = [];
            let policyIds;
            await Policy.find({ _id: { $in: req.body.policyid }, isActive:true }).then(result => {
                policyIds = result.length;

                for (let i = 0; i < result.length; i++) {
                    if (result[i].isActive == true)
                        policyNames.push(result[i].name);

                }
            })
            if (policyIds != req.body.policyid.length)
                return res.status(404).json({ error: true, message: "policies  not exists", data: {} });



            /*
                    var policyIds = [];
                    await Policy.find().then(result => {
                        for (let i = 0; i < result.length; i++) {
                            policyIds.push(result[i]._id);
                        }
                    })
                    let notExist = false;
                    let policyNotExist = [];

                    for (let i = 0; i < req.body.policyid.length; i++) {
                        if (!policyIds.includes(req.body.policyid[i])) {
                            notExist = true;
                            policyNotExist.push(req.body.policyid[i]);
                            
                        }
                    }

                    if (notExist == true)
                        return res.status(404).json({ error: true, message: "policies " + policyNotExist + " not exists", data: {} });
                */

            /*
                    await Policy.find({
                        _id: { $in: req.body.policyid }
                    }).then (
                        result => {
                           
                            for (let i = 0; i < result.length; i++) {
                                if (result[i].isActive == true)
                                    policyNames.push(result[i].name);

                            }
                      
                        });

           */
                    const role = new Role({
                        name: req.body.name,
                        display_name: req.body.display_name.toLowerCase(),
                        description: req.body.description,
                        policyid: req.body.policyid,
                        policies: policyNames

                    });


                    role.save().then(result => {

                        return res.status(200).json({ error: false, message:"new role created",data: result });

                    }
                    ).catch(err => { return res.status(500).json({ error: true, message: err.message, data: {}}) });
      
           
        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    };

    index = (req, res, next) => {
        if (!req.token.policies.includes("show_role")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {}});
        }
        let keys = Object.keys(req.query);
        let filters = new Object();

        if (keys.includes("name")) {

            filters.name = { $regex: req.query["name"], $options: "i" };
        }
        if (keys.includes("diplay_name")) {
            filters.display_name = { $regex: req.query["display_name"], $options: "i" };
        }
        Role.find(filters).then(data => {

            if (data.length == 0) {

                return res.status(404).json({ error:false,message: "no role with such query",data:data });
            }
            return res.status(200).json({ error:false,message:"roles data",data: data });
        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });


    }





    show = (req, res) => {
        if (!req.token.policies.includes("show_role")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Role.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: " role doesn't exist", data: {} });
            }
            return res.status(200).json({ error:false,message:"role data",data: result });
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    }


    destroy = (req, res) => {
        if (!req.token.policies.includes("delete_role")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Role.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error: true, message: "role doesn't exist", data: {} });
            }


            let isActive = result['isActive'] = false;

            Role.updateOne({ _id: req.params.id }, {
                $set: {
                    isActive: isActive
                }
            },
                { upsert: true }).then(result => { return res.status(200).json({ error: false, message: "successfully deleted", data: {} }); });



        }).catch(err => {
            if (err.name == 'CastError') {
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });
            }
            return res.status(500).json({ error: true, message: err.message, data: {}});
        });
    }


    update = async (req, res) => {  
        if (!req.token.policies.includes("update_role")) {
            return res.status(401).json({ error: true, message: "unauthorized access", data: {} });
        }
        Role.findOne({ _id: req.params.id },).then(async(data) => {

            if (data == null) {

                res.status(404).json({ error: true, msg: "role not exists", data: {} });

            } else {
                let name, policyid, policies, display_name;

                var policyNames = [];

             

                    if (req.body.policyid != "") {

                        if (req.body.policyid == undefined) {
                            policyid = data.policyid;
                            policies = data.policies;
                        }
                        else {
                            var policyNames = [];
                            let policyIds;
                            await Policy.find({ _id: { $in: req.body.policyid }, isActive: true }).then(result => {
                                policyIds = result.length;

                                for (let i = 0; i < result.length; i++) {
                                    if (result[i].isActive == true)
                                        policyNames.push(result[i].name);

                                }
                            })
                            if (policyIds != req.body.policyid.length)
                                return res.status(404).json({ error: true, message: "policies  not exists", data: {} });
                      

                            policyid = req.body.policyid;
                            policies = policyNames;
                        }
                  

                    }
                    else {
                        return res.status(404).json({ error: true, message: "roles must have atleast one policy", data: {} });
                    }


                    if (req.body.name != "") {

                        if (req.body.name != undefined && req.body.name.toLowerCase() != data.name.toLowerCase()) {

                            return res.status(404).json({ error: true, message: "can't update name of a role", data: {} });
                        }
       
                        name = req.body.name == undefined ? data.name : req.body.name.toLowerCase();
                 
                    }
                    else {
                        return res.status(404).json({ error: true, message: "name field can't be empty", data: {} });
                    }

                    if (req.body.display_name != "") {
                        display_name = req.body.display_name == undefined ? data.display_name : req.body.display_name;
                    }
                    else {
                        return res.status(404).json({ error: true, message: "display_name field can't be empty", data: {} });
                    }



                    let answer = validations.updateValidations.validate(req.body);

                    if (answer.error) {
                        return res.status(400).json({ error: true, message: answer.error.details[0].message, data: {} });
                    }



                    Role.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,

                            policyid: policyid,
                            policies: policies,
                            //password: password,
                            display_name: display_name
                        }

                    },
                        { upsert: true }).then(result => { res.status(200).json({ error:false,message:"updated role",data: {name,display_name,policyid,policies} }) });
              
            }
       
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format ", data: {} });

            return res.status(500).json({ error: true, message: err.message, data: {} });
        });
    };
}




module.exports = { rolesControllers };