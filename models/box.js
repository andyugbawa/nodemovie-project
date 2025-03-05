const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const filmSchema = new Schema({
    title:{
        type:String,
        required:[true,"Title must not be blank"]
    },
    genre:{
        type:String,
        enum:["action","thriller","drama","comedy","romance","horror"],
        lowercase:true,
       
    },
    year:{
        type:Number,
        min: [1888, "The year must be 1888 or later (first film year)"],
        max: [new Date().getFullYear(), "The year must not be in the future"],
    },


    images: [
      {
          url: String,        // Cloudinary URL
          filename: String    // Cloudinary File ID
      }
  ]


    // images: [
    //     {
    //       url: {
    //         type: String,
    //         required: true,
    //       },
    //       filename: {
    //         type: String,
    //         required: true,
    //       },
    //     },
    //   ],


 
})


const Film = mongoose.model("Film",filmSchema)

module.exports = Film 




// filmSchema.post("findOneAndDelete",async function(doc){
//     if (doc) {
//         await ArchivedFilm.create({
//             title: doc.title,
//             genre: doc.genre,
//             year: doc.year,
//         });
//         console.log(`Archived film: ${doc.title}`);
//     }
// })
