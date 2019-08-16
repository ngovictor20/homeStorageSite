var express = require("express");
var router = express.Router();
var multer = require("multer")
var upload = multer();
const fs = require("fs")


router.get("/",(req,res)=>{
	res.redirect("/folder/5d3b8749710939dd948a453a")
})

module.exports = router;