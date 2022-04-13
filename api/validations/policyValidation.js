const Joi = require('joi');

class policyValidations {
     storeValidations = Joi.object({
         name: Joi.string().trim().required().min(1).max(20).message('name must not be greater than 20 characters'), 
        display_name: Joi.string().lowercase().trim().required().min(1).max(20).message('display name must not be greater than 20 characters'),
         description: Joi.string().required().trim().min(5).max(200).message('display name must not be greater than 20 characters')
    })


     updateValidations = Joi.object({
         name: Joi.string().trim().min(1).max(20).message('name must not be greater than 20 characters'), 
        display_name: Joi.string().trim().min(1).max(20).message('display name must not be greater 20 characters'),
         description: Joi.string().trim().min(5).max(200).message('desription must be of 20 to 2000 characters long'),
    })
}
module.exports = policyValidations;