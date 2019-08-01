var express = require("express");
var router = express.Router();
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
const mongoose = require('mongoose')
const Folder = require("../models/folder")
const FileModel = require("../models/files")


//get request, should stream the file into 
router.get("/folder/:folder_id/:file_id", (req,res)=>{
    console.log("Folder Route")
    FileModel.findById(req.params.file_id).populate("parentFolders").exec((err,doc)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Found file in mongodb")
            res.download(doc.path,(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("download")
                    //res.redirect("/folder/"+req.params.folder_id)
                }
            })
            
            //res.redirect("/folder/"+req.params.folder_id)
        }
    })
})



router.post("/folder/:folder_id/file", upload.single('file'), (req,res)=>{
    console.log("Folder Route")
    let fileSchema = {}
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err,doc)=>{
        if(err){
            console.log(err)
            res.redirect("/folder/"+req.params.folder_id)
        }else{
            console.log(req.file)
            if(req.file){
                fileSchema = {
                    name: req.file.originalname,
                    path: doc.path,
                    fileSize: req.file.size,
                    parentFolder: doc
                }
                console.log(fileSchema)
                //ISSUE IS HERE
                console.log(doc.path+req.file.originalname+"\\")
                //could create a custom storage engine so this is embedded in multer
                fs.writeFile(doc.path+req.file.originalname,req.file.buffer,(err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log("write completed")
                        FileModel.create(fileSchema,(err,newFile)=>{
                            if(err){
                                console.log("mongodb create file failed")
                                console.log(err)
                                res.redirect("/folder/"+req.params.folder_id)
                            }else{
                                console.log("pushing document")
                                doc.childFiles.push(newFile._id)
                                console.log("saving document")
                                doc.save()
                                console.log(doc)
                                res.redirect("/folder/"+req.params.folder_id)
                            }
                        })
                    }
                })
                
                //res.render("../views/folder/renderFolder",{folder : doc})
            }else{
                console.log("file not found")
                res.redirect("/folder/"+req.params.folder_id)
            }
            
        }
    })
})


module.exports = router