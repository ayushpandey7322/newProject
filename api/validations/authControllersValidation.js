const Joi = require('joi');

class authControllersValidations {
    createUsersValidations = Joi.object({
        name: Joi.string().trim().min(1).max(20).required(),

        email: Joi.string().lowercase().required().regex(RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)).message('not a valid email'),
        password: Joi.string().trim().required().regex(RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,10}$/)).message('a password must be between 3 to 10 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'),
        gender: Joi.string().lowercase().required().regex(RegExp(/^(female|male)$/)).message('gender must be male or female'),
        roleid: Joi.number().integer()
    })


    updateUsersValidations = Joi.object({
        name: Joi.string().trim().min(1).max(20),

        email: Joi.string().lowercase().regex(RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)).message('not a valid email'),
        password: Joi.string().trim().regex(RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,10}$/)).message('a password must be between 3 to 10 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'),
        gender: Joi.string().lowercase().regex(RegExp(/^(female|male)$/)).message('gender must be male or female'),
        roleid: Joi.number().integer()
    })

    registerValidations = Joi.object({
        name: Joi.string().trim().min(1).max(20).required(),

        email: Joi.string().lowercase().required().regex(RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)).message('not a valid email'),
        password: Joi.string().trim().required().regex(RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,10}$/)).message('a password must be between 3 to 10 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'),
        gender: Joi.string().lowercase().required().regex(RegExp(/^(female|male)$/)).message('gender must be male or female'),
      
    })

    loginValidations = Joi.object({
        email: Joi.string().lowercase().required().regex(RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)).message('not a valid email'),
        password: Joi.string().trim().required().regex(RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,10}$/)).message('a password must be between 3 to 10 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character')

    })
}
module.exports = authControllersValidations;