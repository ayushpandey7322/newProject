const Joi = require('joi');

class userValidations {
 updateValidations = Joi.object({
        name: Joi.string().trim().min(1).max(20), //avi
        email: Joi.string().lowercase().regex(RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)).message('not a valid email'),
        gender: Joi.string().lowercase().regex(RegExp(/^(female|male)$/)).message('gender must be male or female')
    })
  updatePasswordValidations = Joi.object({

        password: Joi.string().regex(RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,10}$/)).message('a password must be between 3 to 10 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'),

    })

}


module.exports = userValidations;
