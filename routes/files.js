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
            console.log(doc.path)
            res.download(doc.path,(error)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log("download")
                }
            })
        }
    })
})

//create
router.post("/folder/:folder_id/file",upload.single('file'),(req,res)=>{
    console.log("Ajax Request")
    console.log(req.body)
    console.log("req file:")
    console.log(req.file)
    let fileSchema = {}
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err,doc)=>{
        if(err){
            console.log(err)
            console.log("whats going on here")
            res.redirect("/folder/"+req.params.folder_id)
        }else{
            console.log("Request.file")
            console.log(req.file)
            if(req.file){
                fileSchema = {
                    name: req.file.originalname,
                    path: doc.path+req.file.originalname,
                    fileSize: req.file.size,
                    parentFolder: doc._id
                }
                console.log(fileSchema)
                console.log("Path")
                console.log(doc.path+req.file.originalname+"\\")
                //could create a custom storage engine so this is embedded in multer
                fs.writeFile(doc.path+"\\"+req.file.originalname,req.file.buffer,(errorWrite)=>{
                    if(errorWrite){
                        console.log(errorWrite)
                    }else{
                        console.log("write completed")
                        FileModel.create(fileSchema,(error,newFile)=>{
                            if(error){
                                console.log("mongodb create file failed")
                                console.log(err)
                                res.redirect("/folder/"+req.params.folder_id)
                            }else{
                                console.log("pushing document")
                                doc.childFiles.push(newFile._id)
                                console.log("saving document")
                                doc.save()
                                //console.log(doc)
                                console.log("sending newfile document")
                                res.send(newFile)
                            }
                        })
                    }
                })
            }else{
                console.log("file not found")
                res.redirect("/folder/"+req.params.folder_id)
            }            
        }
    })    
})


router.delete("/folder/:folder_id/file",(req,res)=>{
    console.log("Delete Request")
    console.log(req.body)//sits in req.body
    var file_id = req.body.id
    Folder.findById(req.params.folder_id).populate("childFiles").exec((err,fold)=>{
        if(err){
            console.log(err)
        }else{
            var index = fold.childFiles.findIndex((element)=>{
                return element._id.equals(file_id)
            })
            console.log(index)
            FileModel.findByIdAndDelete(file_id,(error,deletedFile)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log(deletedFile)
                    fs.unlink(deletedFile.path,(err)=>{
                        if(err){
                            console.log("error while deleting file")
                            console.log(err)
                        }else{
                            console.log("deleting file")
                            console.log("removing from parent document")
                            fold.childFiles.remove(index)
                            console.log("saving parent")
                            fold.save()
                            res.send({
                                response: "DELETE",
                                parentFolder: fold
                            })
                        }
                    })
                }
            })
        }
    })
    //res.send("Delete response")
})

// router.post("/folder/:folder_id/file", upload.single('file'), (req,res)=>{
//     console.log("Folder Route")
//     let fileSchema = {}
//     Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err,doc)=>{
//         if(err){
//             console.log(err)
//             res.redirect("/folder/"+req.params.folder_id)
//         }else{
//             console.log(req.file)
//             if(req.file){
//                 fileSchema = {
//                     name: req.file.originalname,
//                     path: doc.path,
//                     fileSize: req.file.size,
//                     parentFolder: doc._id
//                 }
//                 console.log(fileSchema)
//                 console.log("Path")
//                 console.log(doc.path+req.file.originalname+"\\")
//                 //could create a custom storage engine so this is embedded in multer
//                 fs.writeFile(doc.path+"\\"+req.file.originalname,req.file.buffer,(err)=>{
//                     if(err){
//                         console.log(err)
//                     }else{
//                         console.log("write completed")
//                         FileModel.create(fileSchema,(err,newFile)=>{
//                             if(err){
//                                 console.log("mongodb create file failed")
//                                 console.log(err)
//                                 res.redirect("/folder/"+req.params.folder_id)
//                             }else{
//                                 console.log("pushing document")
//                                 doc.childFiles.push(newFile._id)
//                                 console.log("saving document")
//                                 doc.save()
//                                 console.log(doc)
//                                 res.redirect("/folder/"+req.params.folder_id)
//                             }
//                         })
//                     }
//                 })
                
//                 //res.render("../views/folder/renderFolder",{folder : doc})
//             }else{
//                 console.log("file not found")
//                 res.redirect("/folder/"+req.params.folder_id)
//             }
            
//         }
//     })
// })

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

module.exports = router