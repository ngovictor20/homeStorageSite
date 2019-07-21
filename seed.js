const mongoose = require('mongoose')
var File = require("./models/files")
var Folder = require("./models/folder")
const fs = require('fs')


function seedDB(){
    fs.readdir(__dirname+"/uploads/",(err,files)=>{
        console.log(files)
    })
}

module.exports = seedDB