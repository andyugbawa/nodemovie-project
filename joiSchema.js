const Joi = require("joi")
module.exports. movieSchema = Joi.object({
    reel:Joi.object({
     title:Joi.string().required(),
     genre:Joi.string().required(),
    //  image:Joi.string().required(),
    year: Joi.number().integer().min(1888).required()
    //  year:Joi.number().required().min(0)
   }).required().unknown(true)
})

 

// const Joi = require("joi");
// module.exports.movieSchema = Joi.object({
//   title: Joi.string().required(),
//   genre: Joi.string().required(),
//   year: Joi.number().integer().min(1888).max(new Date().getFullYear()).required()
// });
