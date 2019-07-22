const mongoose = require('mongoose')
var File = require("./models/files")
var Folder = require("./models/folder")
const fs = require('fs')


function seedDB(){
    let parent
    Folder.findById("5d3520561c9d44000000ce52",(err,doc)=>{
        if(err){
            console.log(err)
        }else{
            parent = doc
        }
    })

    fs.readdir(__dirname+"/uploads/",{withFileTypes:true},(err,files)=>{
        files.forEach(function(x){
            if(x.isDirectory){
                console.log("create a folder model")
                var folderSchema = {
                    name:x.name,
                    path:__dirname + "\\uploads\\" + x.name,
                    parentFolder: parent
                }
                Folder.create(folderSchema,(err,doc)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log("Creating folder document")
                        console.log(doc)
                    }
                })
            }else{
                console.log("create a file model")
                var fileSchema = {

                }
            }
        })
    })
}

module.exports = seedDB