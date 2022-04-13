const Joi = require('joi');

class postValidation {
 postValidation = Joi.object({
        title: Joi.string().trim().lowercase().required().min(5).max(30).message('title must not be greater than 30 characters'), 
        body: Joi.string().lowercase().trim().required().min(1).max(300).message('body must not be greater than 300 characters'),
        status: Joi.string().required().lowercase().regex(RegExp(/^(published|hidden)$/)).message('status must be hidden or published'),
  
    })

  postValidationput = Joi.object({
        title: Joi.string().trim().lowercase().min(5).max(30).message('title must not be greater than 30 characters'), 
        body: Joi.string().trim().lowercase().min(1).max(300).message('body must not be greater than 300 characters'),
        status: Joi.string().lowercase().regex(RegExp(/^(published|hidden)$/)).message('status must be hidden or published'),


    })
}
module.exports = {  postValidation };