var express = require("express");
var router = express.Router();
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
const mongoose = require('mongoose')
const Folder = require("../models/folder")
const File = require("../models/files")


router.get("/folder", (req, res) => {
    res.redirect("/folder/5d52e45cbe36d951897979d4/")
})


//render
router.get("/folder/:folder_id", (req, res) => {
    console.log("Folder Route")
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err, doc) => {
        if (err) {
            console.log(err)
            res.redirect("back")
        } else {
            console.log("Hi")
            console.log(doc)
            res.render("../views/folder/renderFolder", { folder: doc })
        }
    })
})

//create
router.post("/folder/:folder_id/new", (req, res) => {
    console.log("creating folder document")
    console.log(req.body.folderName)
    if (req.body.folderName) {
        Folder.findById(req.params.folder_id).populate("parentFolder").populate("childFolders").exec((err, folder) => {
            if (err) {
                console.log(err)
                res.redirect("/folder/" + req.params.folder_id)
            } else {
                fs.mkdir(folder.path + req.body.folderName, (err) => {
                    if (err) {
                        console.log("error with mkdir")
                    } else {
                        var newFolderObj = {
                            name: req.body.folderName,
                            parentFolder: folder._id,
                            path: folder.path + req.body.folderName + "\\"
                        }
                        Folder.create(newFolderObj, (err, newFolder) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(newFolder)
                                folder.childFolders.push(newFolder._id)
                                folder.save()
                                res.redirect("/folder/" + newFolder._id)
                            }
                        })

                    }
                })
            }

        })
    }
    else {
        console.log("Why am i here?")
        return
    }
})

//delete
router.delete("/folder/:folder_id", (req, res) => {
    console.log("Delete folder route")
    // Folder.findByIdAndDelete(req.params.folder_id).populate("childFiles").exec((err, deletedDoc) => {
    //     if (err) {
    //         console.log(err)
    //         console.log("ran into an error with finding")
    //     } else {
    //         deletedDoc.childFiles.forEach((x) => {
    //             fs.unlink(x.path, (error) => {
    //                 File.findByIdAndDelete(x._id, (delError, deletd) => {
    //                     if (delError) {
    //                         console.log(delError)
    //                     } else {
    //                         console.log("Deleted" + deletd.name + " from Mongo")
    //                     }
    //                 })
    //             })
    //         })
    //         console.log("Done deleting folder")
    //     }
    // })
    Folder.findByIdAndDelete(req.params.folder_id).populate("childFiles").exec((err,deletedDoc)=>{
        let fun
        if(err){
            console.log(err)
            console.log("ran into an error with finding folder")
        }else{
            deletedDoc.childFiles.forEach((x)=>{
                console.log("pushing")
                fun.push(del(x))
            })
            Promise.all(fun).then(function(val){
                console.log(val)
            })
        }
    })
})





//update
//ajax
router.post("/folder/:folder_id/edit", (req, res) => {
    Folder.findByIdAndUpdate(req.params.folder_id, {}, (err, doc) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/folder/" + req.params.folder_id)
        }
    })
})


function del(x) {
    return new Promise(function (resolve, reject) {
        fs.unlink(x.path, (error) => {
            if (error) {
                console.log("failed at unlink")
                reject(error)
            } else {
                File.findByIdAndDelete(x._id, (delError, deletd) => {
                    if (delError) {
                        console.log(delError)
                        reject("Failure: " + x._id)
                    } else {
                        console.log("Deleted" + deletd.name + " from Mongo")
                        resolve(x._id)
                    }
                })
            }
        })
    })
}




module.exports = router