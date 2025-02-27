const express = require("express");
const router = express.Router();
const upload = require("../routes/multerConfig");
const Film = require("../models/box"); // Assuming you have a Film model

router.post("/reel", upload.array("image"), async (req, res) => {
  try {
    const { title, genre, year } = req.body;

    if (!title || !genre || !year) {
      return res.status(400).send("Title, genre, and year are required fields.");
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No images uploaded.");
    }

    const newReel = new Film({
      title,
      genre,
      year,
      images: req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      })),
    });

    await newReel.save();
    req.flash("success", "Successfully made a new Film");
    res.redirect(`/reel/${newReel._id}`);
  } catch (err) {
    console.error("Error creating film:", err.message);
    res.status(500).send("An error occurred while creating the film.");
  }
});

module.exports = router;
