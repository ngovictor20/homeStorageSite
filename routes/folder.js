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
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err,doc)=>{
        if(err){
            console.log(err)
        }else{
            res.render("../views/folder/renderFolder",{folder : doc})
        }
    })
})

//create
router.post("folder",(req,res)=>{
    console.log("creating folder document")
    //Folder.create()

    //fs.mkdir("")
})


//edit
router.get("folder/:folder_id/edit",(req,res)=>{
    Folder.findByIdAndUpdate(req.params.folder_id,{},(err,doc)=>{
        if(err){
            console.log(err)
        }else{
            res.redirect("/folder/"+req.params.folder_id)
        }
    })
})


//update



async function createFolder(pth){
    fs.mkdir(pth,(err)=>{
	if(err){
	    console.log(err)
	}else{
	    console.log("Creating folder")
	}
    })
}



async function listDir(pth){
    fs.readdir(pth,{
	withFileTypes:true
    }, (err,files)=>{
	if(err){
	    throw(err)
	}else{
	    console.log("returning files")
	    console.log(files)
	    return(files)
	}
    })
}


module.exports = router