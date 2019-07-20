const app = require('express')()
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();