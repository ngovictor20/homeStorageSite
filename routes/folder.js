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


router.get("/folder", (req, res) => {
    res.redirect("/folder/5d3b8749710939dd948a453a")
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
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").exec((err, deletedDoc) => {
        if (err) {
            console.log(err)
            console.log("ran into an error with finding folder")
        } else {
            console.log("Starting recursive function")
            if(deletedDoc){
                console.log(deletedDoc)
                delRecursive(deletedDoc).then(function (val) {
                    console.log("Finished recursive function:" + val)
                    res.send(val)
                })
            }else{
                res.redirect("back")
            }
        }
    })
})


//update
//ajax
router.post("/folder/:folder_id/edit", (req, res) => {
    console.log(req.body)
    if(req.body.name){
        Folder.findByIdAndUpdate(req.params.folder_id, {name: req.body.name}, (err, foundDoc) => {
            if (err) {
                console.log("Ran into error while updating")
                console.log(err)
            } else {
                fs.rename(foundDoc.path,)
                res.redirect("/folder/" + req.params.folder_id)
            }
        })
    }else{
        console.log("req.body.name is empty")
        res.redirect("back")
    }

})



//functions for folder deletion 

function delRecursive(fold) {
    return new Promise(function (resolve, reject) {
        console.log("About to call mongodb find")
        Folder.findByIdAndDelete(fold._id).populate("childFiles").populate("childFolders").exec((err, doc) => {
            console.log("Inside delete callback")
            if (err) {
                console.log("ran into an error in finding folder document" + err)
                reject(err)
            } else {
                console.log(fold)
                console.log("Find successful")
                let childFolderList = []
                console.log(doc.childFolders)
                if(doc.childFolders){
                    doc.childFolders.forEach(function (folder) {
                        if(folder){
                            console.log(folder)
                            console.log("Pushing recursive function into childFolderList Variable, id: " + folder._id)
                            childFolderList.push(delRecursive(folder))
                        }
                    })
                }
                if(childFolderList.length != 0){
                    let fun = []
                    console.log("Child Folders Exist")
                    Promise.all(childFolderList).then(function (result) {
                        if (doc.childFiles) {
                            doc.childFiles.forEach((x) => {
                                console.log("pushing")
                                fun.push(delFile(x))
                            })
                            Promise.all(fun).then(function (val) {
                                fs.rmdir(doc.path,(rmDirErr)=>{
                                    if(rmDirErr){
                                        console.log("FS: deleting folder error")
                                        console.log(rmDirErr)
                                        reject("Failure: "+rmDirErr)
                                    }else{
                                        console.log("FS: Folder has been deleted successfully")
                                        resolve("Done:" + val)
                                    }
                                })
                            })
                        } else {
                            fs.rmdir(doc.path,(rmDirErr)=>{
                                if(rmDirErr){
                                    console.log("FS: deleting folder error")
                                    console.log(rmDirErr)
                                    reject("Failure: "+rmDirErr)
                                }else{
                                    console.log("FS: Folder has been deleted successfully")
                                    resolve("Done:" + doc.path)
                                }
                            })
                        }
                    })
                }else{
                    console.log("No child folders")
                    let fun = []
                    console.log("Child Files Check If Statement for:" + doc.path)
                    if (doc.childFiles) {
                        doc.childFiles.forEach((x) => {
                            console.log(x)
                            console.log("pushing")
                            fun.push(delFile(x))
                        })
                        Promise.all(fun).then(function (val) {
                            fs.rmdir(doc.path,(rmDirErr)=>{
                                if(rmDirErr){
                                    console.log("FS: deleting folder error")
                                    console.log(rmDirErr)
                                    reject("Failure: "+rmDirErr)
                                }else{
                                    console.log("FS: Folder has been deleted successfully")
                                    resolve("Done:" + doc.path)
                                }
                            })
                        })
                    } else {
                        console.log("No Child Files for: "+ doc.path)
                        fs.rmdir(doc.path,(rmDirErr)=>{
                            if(rmDirErr){
                                console.log("FS: deleting folder error")
                                console.log(rmDirErr)
                                reject("Failure: "+rmDirErr)
                            }else{
                                console.log("FS: Folder has been deleted successfully")
                                resolve("Done:" + doc.path)
                            }
                        })
                    }
                }
            }
        })
    })
}


function delFile(x) {
    console.log("Calling del function")
    console.log(x)
    return new Promise(function (resolve, reject) {
        fs.unlink(x.path, (error) => {
            if (error) {
                console.log("failed at unlink")
                reject(error)
            } else {
                FileModel.findByIdAndDelete(x._id, (delError, deletd) => {
                    if (delError) {
                        console.log(delError)
                        reject("Failure: " + x._id)
                    } else {
                        console.log("Deleted" + deletd.name + " from Mongo")
                        resolve("Successfully Deleted File in " + x.path)
                    }
                })
            }
        })
    })
}




module.exports = router