var express = require("express");
var router = express.Router();
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
const mongoose = require('mongoose')
const Folder = require("../models/folder")





module.exports = router