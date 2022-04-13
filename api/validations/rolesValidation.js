const Joi = require('joi');
class rolesValidations {
 storeValidations = Joi.object({
        name: Joi.string().trim().min(1).max(30).required(), //avi
        display_name: Joi.string().lowercase().trim().required().min(1).max(30).message('display name must not be greater 20 characters'),
        policyid: Joi.array().items(Joi.number()).required(),
        policies: Joi.array().items(Joi.string())
    })

updateValidations = Joi.object({
        name: Joi.string().trim().min(1).max(30), //avi
        display_name: Joi.string().trim().min(1).max(30).message('display name must not be greater 20 characters'),
        policyid: Joi.array(),
        policies: Joi.array().items(Joi.number())
    })
}
module.exports = rolesValidations;