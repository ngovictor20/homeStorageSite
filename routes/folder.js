var express = require("express");
var router = express.Router();
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
const mongoose = require('mongoose')
const Folder = require("../models/folder")


//render
router.get("folder/:folder_id", (req,res)=>{
    console.log("Folder Route")

})

//create



//edit



//update



module.exports = router