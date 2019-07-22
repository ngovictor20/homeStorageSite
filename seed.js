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
            fs.readdir(__dirname+"/uploads/",(err,files)=>{
                files.forEach(function(x){
                    fs.lstat(__dirname+"/uploads/"+x,(err,stat)=>{
                        if(stat.isDirectory()){
                            console.log("create a folder model")
                            var folderSchema = {
                                name:x,
                                path:__dirname + "\\uploads\\" + x,
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
                        }else if(stat.isFile()){
                            console.log("create a file model")
                            var fileSchema = {
                                name: x,
                                path: __dirname+"\\uploads\\"+x,
                                fileSize: stat.size,
                                parentFolder: parent
                            }
                            File.create(fileSchema,(err,doc)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    console.log("Creating file document")
                                    console.log(doc)
                                }
                            })
                        }
        
                    })
                })
            })
        }
    })

    
}

module.exports = seedDB