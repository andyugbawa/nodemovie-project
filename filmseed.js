const mongoose = require("mongoose")
const Film = require("./models/box")

mongoose.connect('mongodb://127.0.0.1:27017/filmState')
  .then(() => {
    console.log(" MONGO CONNECTION OPEN");
  })
  .catch(err => {
    console.error("MONGO CONNECTION ERROR", err);
  });





  const seedFilm = [
    {
        title:"Hard Corp",
        genre:"action",
        year:2009
    },
    {
        title:"Super flash",
        genre:"thriller",
        year:2010
    },
    {
        title:"space cadet",
        genre:"drama",
        year:2023
    },
    {
        title:"mufasa",
        genre:"action",
        year:2024
    },
    
  ]

  Film.insertMany(seedFilm)
  .then(res=>{
    console.log(res)
  }).catch(e=>{
    consoe.log(e)
  })