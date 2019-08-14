var express = require("express");
var router = express.Router();
var multer = require("multer")
var upload = multer();
const fs = require("fs")


router.get("/",(req,res)=>{
	res.redirect("/folder/5d52e45cbe36d951897979d4/")
})

module.exports = router;