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
router.get("/folder/:folder_id", (req,res)=>{
    console.log("Folder Route")
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err,doc)=>{
        if(err){
            console.log(err)
            res.redirect("back")
        }else{
            console.log("Hi")
            console.log(doc)
            res.render("../views/folder/renderFolder",{folder : doc})
        }
    })
})

//create
router.post("/folder/:folder_id/new",(req,res)=>{
    console.log("creating folder document")
    console.log(req.body.folderName)
    if(req.body.folderName){
        Folder.findById(req.params.folder_id).populate("parentFolder").populate("childFolders").exec((err,folder)=>{
            if(err){
                console.log(err)
                res.redirect("/folder/"+req.params.folder_id)
            }else{
                fs.mkdir(folder.path+req.body.folderName,(err)=>{
                    if(err){
                        console.log("error with mkdir")
                    }else{
                        var newFolderObj = {
                            name: req.body.folderName,
                            parentFolder:folder._id,
                            path: folder.path+req.body.folderName
                        }
                        Folder.create(newFolderObj,(err,newFolder)=>{
                            if(err){
                                console.log(err)
                            }else{
                                console.log(newFolder)
                                folder.childFolders.push(newFolder._id)
                                folder.save()
                                res.redirect("/folder/"+newFolder._id)
                            }
                        })
                        
                    }
                })
            }
            
        })
    }
    else{
        console.log("Why am i here?")
        return
    }
})


//update
//ajax
router.post("folder/:folder_id/edit",(req,res)=>{
    Folder.findByIdAndUpdate(req.params.folder_id,{},(err,doc)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect("/folder/"+req.params.folder_id)
        }
    })
})


module.exports = router