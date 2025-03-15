  require("dotenv").config();

  
  const express = require("express");
  const app = express();
  const path = require("path");
  const mongoose = require("mongoose");
  const AppError = require("../utils/AppError");
  const wrapAsync = require("../utils/wrapAsync");
  const router = express.Router();
  // const { isLoggedIn } = require("./index");
  const { movieSchema } = require("../joiSchema");
  const Film = require("../models/box");
  const bcrypt = require("bcrypt");
  const methodOverride = require("method-override");
  // const User = require("../models/user");
  const passport = require("passport");
  const session = require("express-session");
  const flash = require("connect-flash");
  const LocalStrategy = require("passport-local");
  const {storage} = require("../cloudinary")
  const Client = require("../models/client");
  const multer = require("multer");
  
  // const upload = multer({ dest: "uploads/" });
  const upload = multer({storage});
  const reelRoutes = require("../routes/reelRoutes");
  
  
  const absolutepath = path.join(__dirname, "./public");
  app.use(express.static(absolutepath));
  app.use(express.static("public"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));
  app.use('/uploads', express.static('uploads'));

  
  
  const sessionOptions = {
    secret: "thisisakeptsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  };
  app.use(session(sessionOptions));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(Client.authenticate()));
  passport.serializeUser(Client.serializeUser());
  passport.deserializeUser(Client.deserializeUser());


  // const MONGO_URI = process.env.VERCEL_ENV === 'production' 
  //   ? process.env.MONGO_URI_PROD
  //   : process.env.MONGO_URI_PROD;

  const MONGO_URI = process.env.VERCEL_ENV === 'production' 
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI_DEV;


    
if (!MONGO_URI) {
  console.error("❌ MongoDB URI is missing! Check your .env file.");
  process.exit(1);
}
  
  
mongoose.connect(MONGO_URI, {
  dbName: "filmState",
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB successfully!"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});
  
  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.messages = req.flash("success");
    res.locals.error = req.flash("error");
    next();
  });
  
  
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "ejs");
  
  
  app.use("/reel", reelRoutes);
  app.use("/uploads", express.static("uploads"));



  app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    next();
  });


  app.use((req, res, next) => {
    res.locals.user = req.user; // Passport stores user in req.user
    next();
  });
  
  



  const validateMovie = (req, res, next) => {
    try {
      const { error } = movieSchema.validate(req.body.reel);
      if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new AppError(msg, 400);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
  


  function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {  // ✅ Uses Passport.js authentication check
        req.flash("error", "You must be logged in to access this page.");
           return res.redirect("/login");
        // return res.redirect("/show");
    }
    next();
}

// Export the function
module.exports = { isLoggedIn };

  
  
  




app.get("/", wrapAsync(async (req, res, next) => {
  try {
      const reels = await Film.find({});
      res.render("reel/index", { reels });  // ✅ Render the EJS template and pass data
  } catch (err) {
      next(err);
  }
}));


router.get("/reel/new", isLoggedIn, (req, res) => {
  res.render("reels/new");
});

module.exports = router;





  

  
  app.get("/reel/new", (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be signed in");
      // return res.redirect("/login");
       res.render("reel/new");
    }
    res.render("reel/new");
  });
  


  app.get("/reel/:id", async (req, res) => {
    try {
      const reel = await Film.findById(req.params.id);
      if (!reel) {
        req.flash("error", "Film not found.");
        return res.redirect("/reel");
      }
      res.render("reel/show", { reel });
    } catch (error) {
      console.error(error);
      req.flash("error", "Error fetching film.");
      res.redirect("/reel");
    }
  });
  






  app.post("/reel", upload.array("image"), wrapAsync(async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);
  
    const { title, genre, year } = req.body;
    if (!title || !genre || !year) {
      req.flash("error", "Title, genre, and year are required.");
      return res.redirect("/reel/new");
    }
  
    if (!req.files || req.files.length === 0) {
      req.flash("error", "No images uploaded.");
      return res.redirect("/reel/new");
    }
  
    try {
      const newReel = new Film({
        title,
        genre,
        year,
        images: req.files.map(file => ({
          url: file.path,
          filename: file.filename,
        })),
      });
  
      const savedReel = await newReel.save();
      console.log("Saved Reel:", savedReel);
  
      if (!savedReel) {
        req.flash("error", "Error saving film.");
        return res.redirect("/reel/new");
      }
  
      req.flash("success", "Successfully created a new Film");
      res.redirect(`/reel/${savedReel._id}`);
    } catch (error) {
      console.error("Error saving film:", error);
      req.flash("error", "An unexpected error occurred.");
      res.redirect("/reel/new");
    }
  }));
  





  
  
  app.get("/reel/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const reel = await Film.findById(id);
    if (!reel) {
      throw new AppError("Film not found", 404);
    }
    res.render("reel/edit", { reel, messages: req.flash("success") });
  }));
  
  app.put("/reel/:id", validateMovie, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const reel = await Film.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    req.flash("success", "Successfully updated the Film");
    res.redirect(`/reel/${reel._id}`);
  }));
  
  app.get("/register", (req, res) => {
    res.render("reel/register");
  });
  


app.post("/register", wrapAsync(async (req, res, next) => {
  try {
      const { username, email, password } = req.body;
      const client = new Client({ username, email });
      const registeredUser = await Client.register(client, password);

      if (!registeredUser) {
          req.flash("error", "Registration failed! Please try again.");
          return res.redirect("/register");
      }

      // ✅ Log in the user automatically after registration
      req.login(registeredUser, (err) => {
          if (err) return next(err);
          req.flash("success", `Welcome, ${registeredUser.username}`);
          return res.redirect("/");
      });

  } catch (err) {
      next(err); // Handle errors properly
  }
}));






  
  app.get("/login", (req, res) => {
    res.render("reel/login");
  });




app.post("/login", (req, res, next) => {
  const { username } = req.body;

  // Check if the user exists in the database
  Client.findOne({ username }).then(existingUser => {
      if (!existingUser) {
          req.flash("error", "User not found! Please register first.");
          return res.redirect("/register"); // Redirect to register if the user doesn't exist
      }

      // Authenticate user using Passport.js
      passport.authenticate("local", (err, user, info) => {
          if (err) return next(err);
          if (!user) {
              req.flash("error", "Invalid username or password!");
              return res.redirect("/login");
          }

          req.logIn(user, (err) => {
              if (err) return next(err);
              
              req.flash("success", ` ${user.username}!`); // ✅ Flash success message with username
              return res.redirect("/");
          });
      })(req, res, next);
  }).catch(err => next(err));
});

  
  app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });
  
  app.get("/secret", isLoggedIn, (req, res) => {
    res.redirect("/reel");
  });


  app.get("/reel/:id", isLoggedIn, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const reel = await Film.findById(id);
  
    if (!reel) {
      return next(new AppError("Film not found", 404));  // Handle error properly
    }
  
    res.render("reel/show", { reel, user: req.user });  // ✅ Pass user info
  }));
  
  



  app.delete("/reel/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Film.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the movie!");
    res.redirect("/");
  }));
  
  
  app.all("*", (req, res, next) => {
    next(new AppError("Page not found", 404));
  });
  

  app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    console.error("Error:", err);

    res.status(status).json({ error: message });  // ✅ Respond with JSON
});


  // app.use((err, req, res, next) => {
  //   const { status = 500, message = "Something went wrong!" } = err;
  //   if (err.name === "ValidationError") {
  //     req.flash("error", err.message);
  //   }
  //   res.status(status).render("error", { err });
  // });

  app.use((err, req, res, next) => {
    console.error("Caught an error:", err);
    res.status(err.status || 500).render("error", { err });
  });
  
  


  // const serverless = require("serverless-http");
  // module.exports = serverless(app);
  
  
  app.listen(3000,()=>{
      console.log("APP LISTENING ON 3000")
  })
  
  
  



















































































































































































































// if(process.env.NODE_ENV !=="production"){
//     require("dotenv").config()
//   }
//   const express = require("express");
//   const app = express();
//   const path = require("path")
//   const mongoose = require("mongoose")
//   const AppError = require("../utils/AppError")
//   const wrapAsync =require("../utils/wrapAsync")
//   const {movieSchema} =require("../joiSchema")
//   const Film = require("../models/box")
//   const bcrypt = require("bcrypt")
//   const methodOverride = require("method-override")
//   const User = require("../models/user")
//   const res = require("express/lib/response");
//   const { error } = require("console");
//   const passport = require("passport")
//   const session = require("express-session");
//   const flash = require("connect-flash");
//   const LocalStrategy = require("passport-local");
//   const Client = require("../models/client")
//   const multer = require("multer");
  
//   const upload = multer({ dest: "uploads/" });
//   const reelRoutes = require("../routes/reelRoutes");
  
  
    
//   const absolutepath = path.join(__dirname, './public');
//   app.use(express.static(absolutepath));
//   app.use(express.json());
//   const sessionOptions = {secret:"thisisakeptsecret ",resave:false,saveUninitialized:false}
//   app.use(session(sessionOptions));
//   app.use(flash())
  
//   app.use(passport.initialize());
//   app.use(passport.session())
//   passport.use(new LocalStrategy(Client.authenticate()))
//   passport.serializeUser(Client.serializeUser())
//   passport.deserializeUser(Client.deserializeUser())
  
//   app.use((req,res,next)=>{
//       res.locals.messages = req.flash("success")
//       res.locals.error = req.flash("error"); 
//       next()
//   })
  
  
  
//   mongoose.connect('mongodb://127.0.0.1:27017/filmState')
//     .then(() => {
//       console.log(" MONGO CONNECTION OPEN");
//     })
//     .catch(err => {
//       console.error("MONGO CONNECTION ERROR", err);
//     });
  
//   app.use(methodOverride("_method"))
//   app.set("views", path.join(__dirname,"views"))
//   app.set("view engine","ejs")
//   app.use(express.urlencoded({extended:true}))
//   app.use(express.json());
//   app.use("/reel", reelRoutes);
//   app.use('/uploads', express.static('uploads'));
  
  
  
  
  
  
  
//   const validateMovie = (req,res,next)=>{
    
//       const {error} = movieSchema.validate(req.body.reel);
//       if(error){
//           const msg = error.details.map(el =>el.message).join(",")
//           throw new AppError(msg,400)
//       }else{
//           next()
//       }
     
//   }
  
  
  
//   const userLogin =(req,res,next)=>{
//       if(!req.session.user_id){
//            res.redirect("/login")
//           return;
//       }
//       next()
//   }
  
  
  
//   app.get("/reel", wrapAsync(async (req, res, next) => {
//     try {
//       const reels = await Film.find({});
//       res.json({ reels }); // ✅ Fix: Always send JSON
//     } catch (err) {
//       next(err);
//     }
//   }));
  
  
//   // app.get("/reel", wrapAsync(async (req,res,next)=>{
      
//   //         const reels = await Film.find({});
//   //         res.render("reel/index",{reels})
      
//   // }))
  
  
//   app.get("/reel/new",(req,res)=>{
//     if(!req.isAuthenticated()){
//       req.flash("error","you must be signed in")
//       res.redirect("/login")
//     }
//       res.render("reel/new")
      
//   })
  
  
//   app.post("/reel", upload.array("image"), async (req, res) => {
//     try {
//       console.log("Request Body:", req.body);
//       console.log("Uploaded Files:", req.files);
  
//       const { title, genre, year } = req.body;
//       if (!title || !genre || !year) {
//         return res.status(400).send("Title, genre, and year are required fields.");
//       }
  
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).send("No images uploaded."); 
//       }
  
//       const newReel = new Film({
//         title,
//         genre,
//         year,
//         images: req.files.map((file) => ({
//           url: file.path,
//           filename: file.filename,
//         })),
//       });
  
//       await newReel.save();
//       req.flash("success", "Successfully made a new Film");
//       return res.redirect(`/reel/${newReel._id}`); 
//     } catch (err) {
//       console.error("Error creating film:", err.message);
//       return res.status(500).send("An error occurred while creating the film."); 
//     }
//   });
  
//   app.get("/reel/:id/edit",wrapAsync(async(req,res,next)=>{
      
//           const {id} = req.params;
//           const reel = await Film.findById(id)
//           if(!reel){
//                throw new AppError("Film not found",404)
//            }
//           res.render("reel/edit",{reel,messages:req.flash("success")})
  
//   }))
  
  
//   app.put("/reel/:id", validateMovie,wrapAsync(async(req,res,next)=>{
      
//           const {id} = req.params;
//           const reel = await Film.findByIdAndUpdate(id,req.body,{runValidators:true,new:true}) 
//           req.flash("success","Successfully edit a new Film")
//           res.redirect(`/reel/${reel._id}`)
  
    
//   }))
  
  
  
  
//   app.get("/register",(req,res)=>{
//       res.render("reel/register")
//   })
  
  
//   app.post("/register", async (req, res) => {
//     try {
//       const { username, email, password } = req.body;
//       const client = new Client({ username, email });
//       await Client.register(client, password);
//       req.flash("success", "User registered successfully!");
//       return res.redirect("/login"); 
//     } catch (err) {
//       console.error("Error during registration:", err.message);
//       req.flash("error", "Failed to register user. Please try again.");
//       return res.redirect("/login"); 
//     }
//   });
  
//   app.get("/login",(req,res)=>{
//       res.render("reel/login")
//   })
  
  
//   app.post("/login", passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true
//   }), (req, res) => {
//     req.flash("success", "Welcome!");
//     return res.redirect("/reel"); 
//   });
  
  
//     app.post("/logout",(req,res)=>{
//       req.session.destroy();
//       res.redirect("/login")
//     })
  
//      app.get("/uptop",userLogin,(req,res)=>{
//       res.send("NEW UP")
//      })
  
//     app.get("/secret",userLogin,(req,res)=>{
//       res.redirect("/reel")
     
//     })
  
//     app.get("/reel/:id", wrapAsync(async (req, res, next) => {
//       const { id } = req.params;
//       const reel = await Film.findById(id);
//       if (!reel) {
//         return next(new AppError("Film not found", 404)); 
//       }
//       res.render("reel/show", { reel });
//     }));
    
  
//   app.delete("/reel/:id",async(req,res)=>{
//       const {id} = req.params;
//       const deleteReel = await Film.findByIdAndDelete(id);
//       req.flash("success", "Successfully deleted the movie!");
//       res.redirect("/reel")
     
//   })
  
//   app.all("*",(req,res,next)=>{
//       next(new AppError("Page not Found",404))
//   })
  
  
  
//   app.use((err, req, res, next) => {
//       const { status = 500, message = "Something went wrong!" } = err;
//       if (err.name === "ValidationError") {
//         req.flash("error", err.message);
//       }
//       res.status(status).render("error", { err });
//     });
  
  
  
  
//     module.exports = app;
  
    
//   // app.listen(3000,()=>{
//   //     console.log("APP LISTENING ON 3000")
//   // })




