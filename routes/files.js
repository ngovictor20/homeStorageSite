var express = require("express");
var router = express.Router();
const fs = require('fs-extra');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
const mongoose = require('mongoose')
const Folder = require("../models/folder")
const FileModel = require("../models/files")


//get request, should stream the file into 
router.get("/folder/:folder_id/file/:file_id", (req, res) => {
    console.log("Folder Route")
    FileModel.findById(req.params.file_id).populate("parentFolders").exec((err, doc) => {
        if (err) {
            console.log(err)
        } else {
            console.log("Found file in mongodb")
            console.log(doc.path)
            res.download(doc.path, (error) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log("download")
                }
            })
        }
    })
})

//create
router.post("/folder/:folder_id/file", upload.single('file'), (req, res) => {
    console.log("Ajax Request")
    console.log(req.body)
    console.log("req file:")
    console.log(req.file)
    let fileSchema = {}
    Folder.findById(req.params.folder_id).populate("childFiles").populate("childFolders").populate("parentFolder").exec((err, doc) => {
        if (err) {
            console.log(err)
            console.log("whats going on here")
            res.redirect("/folder/" + req.params.folder_id)
        } else {
            console.log("Request.file")
            console.log(req.file)
            if (req.file) {
                fileSchema = {
                    name: req.file.originalname,
                    path: doc.path + req.file.originalname,
                    fileSize: req.file.size,
                    parentFolder: doc._id
                }
                console.log(fileSchema)
                console.log("Path")
                console.log(doc.path + req.file.originalname + "\\")
                //could create a custom storage engine so this is embedded in multer
                fs.writeFile(doc.path + "\\" + req.file.originalname, req.file.buffer, (errorWrite) => {
                    if (errorWrite) {
                        console.log(errorWrite)
                    } else {
                        console.log("write completed")
                        FileModel.create(fileSchema, (error, newFile) => {
                            if (error) {
                                console.log("mongodb create file failed")
                                console.log(err)
                                res.redirect("/folder/" + req.params.folder_id)
                            } else {
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
            } else {
                console.log("file not found")
                res.redirect("/folder/" + req.params.folder_id)
            }
        }
    })
})

//delete
router.delete("/folder/:folder_id/file", (req, res) => {
    console.log("Delete Request")
    console.log(req.body)//sits in req.body
    var file_id = req.body.id
    Folder.findById(req.params.folder_id).populate("childFiles").exec((err, fold) => {
        if (err) {
            console.log(err)
        } else {
            var index = fold.childFiles.findIndex((element) => {
                return element._id.equals(file_id)
            })
            console.log(index)
            FileModel.findByIdAndDelete(file_id, (error, deletedFile) => {
                if (error) {
                    console.log(error)
                    res.redirect("back")
                } else {
                    console.log(deletedFile)
                    fs.unlink(deletedFile.path, (err) => {
                        if (err) {
                            console.log("error while deleting file")
                            console.log(err)
                        } else {
                            console.log("deleting file")
                            console.log("removing from parent document")
                            fold.childFiles.remove(index)
                            console.log("saving parent")
                            fold.save()
                            res.send(deletedFile)
                        }
                    })
                }
            })
        }
    })
    //res.send("Delete response")
})

//update
router.post("/folder/:folder_id/file/:file_id", (req, res) => {
    console.log("update request for file")
    console.log(req)
    if (req.body) {
        FileModel.findById(req.params.file_id).populate("parentFolder").exec((err, foundFile) => {
            if (err) {
                console.log("Error with updating/finding file")
                console.log(err)
                res.send({
                    error: err
                })
            } else {
                fs.exists((foundFile.path), (exists) => {
                    if (exists) {
                        console.log("time to change name")
                        fs.rename(foundFile.path, foundFile.parentFolder.path + req.body.fileName, (renameError) => {
                            if (renameError) {
                                console.log("Error encountered when trying to call FS rename")
                                res.send({
                                    error: renameError
                                })
                            } else {
                                console.log("rename successful, modifying file information in MongoDB")
                                console.log("Before: " + foundFile)
                                foundFile.name = req.body.fileName
                                foundFile.path = foundFile.parentFolder.path + req.body.fileName
                                console.log("saving document")
                                foundFile.save()
                                console.log("After: " + foundFile)
                                res.send(foundFile)
                            }
                        })
                    } else {
                        console.log("ERROR, FILE DOES NOT EXIST")
                        res.send({
                            error: "File path does not exist" + foundFile.path
                        })
                    }
                })
                // console.log("updated the file, new name: " + foundFile.name)
                // res.send(foundFile)
            }
        })
    } else {
        console.log("Req.body does not exist")
        res.send({
            error: "No req.body found"
        })
    }
})

//move file
router.put("/folder/:folder_id/file/:file_id", (req, res) => {
    console.log(req.url)
    console.log("MOVE FILE ROUTE")
    console.log(req.body)
    FileModel.findById(req.params.file_id).populate("parentFolder").exec().then((foundFile)=>{
        console.log(foundFile)
        Folder.findById(req.body.destFolderID).populate("childFiles").exec().then((destFolder)=>{
            console.log("found dest folder")
            fs.move(foundFile.path,destFolder.path+foundFile.name).then(()=>{
                console.log("success moving")
                Folder.findById(foundFile.parentFolder._id).populate("childFiles").exec().then((parentFolder)=>{
                    var index = parentFolder.childFiles.findIndex((element) => {
                        console.log(element._id)
                        return foundFile._id.equals(element._id)
                    })
                    console.log("Searching for file in child Files. Index: " + index )
                    parentFolder.childFiles.splice(index,1)
                    console.log("Saving parent folder")
                    parentFolder.save()
                    foundFile.parentFolder = destFolder._id
                    foundFile.path = destFolder.path+foundFile.name
                    console.log("Saving moved file")
                    foundFile.save()
                    destFolder.childFiles.push(foundFile._id)
                    console.log("Saved ")
                    destFolder.save()
                    console.log(parentFolder)
                    console.log(foundFile)
                    console.log(destFolder)
                    res.send(foundFile)
                })
            }).catch((fsErr)=>{
                console.log("FS ERROR")
                console.log(fsErr)
                res.send({err:fsErr})
            })
        }).catch((destErr)=>{
            console.log("Ran into error")
            res.send({err:destErr})
        })
    }).catch((err)=>{
        console.log("Ran into error")
        res.send({err:err})
    })
})

//copy file
router.post("/folder/:folder_id/file/:file_id/copy", (req, res) => {
    FileModel.findById(req.params.file_id).populate("parentFolder").exec((err, foundFile) => {
        if (err) {
            res.send({ err: err })
        } else {
            fs.pathExists(foundFile.parentFolder.path + "COPY OF " + foundFile.name).then(() => {

            })
            fs.copy(foundFile.path, foundFile.parentFolder.path + "COPY OF " + foundFile.name).then(() => {
                var fileObject = {
                    name: "COPY OF " + foundFile.name,
                    path: foundFile.parentFolder.path + "COPY OF " + foundFile.name,
                    fileSize: foundFile.fileSize,
                    parentFolder: foundFile.parentFolder._id
                }
                FileModel.create(fileObject, (newerr, newFile) => {
                    if (newerr) {
                        console.log("Error with file creation in MongoDB")
                        res.send({ err: newerr })
                    } else {
                        Folder.findById(foundFile.parentFolder).populate("childFiles").exec((parentErr, foundParentFile) => {
                            if (parentErr) {
                                console.log("Error with file creation in MongoDB")
                                res.send({ err: parentErr })
                            } else {
                                foundParentFile.childFiles.push(newFile)
                                foundParentFile.save()
                                res.send(newFile)
                            }
                        })
                    }
                })
            }).catch((fsError) => {
                console.log(fsError)
                res.send({ err: fsError })
            })
        }
    })
})


Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

module.exports = router