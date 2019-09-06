var express = require("express");
var router = express.Router();
const fs = require('fs-extra')
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
                        res.redirect("/folder/" + folder._id)
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
                                res.send(newFolder)
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
            if (deletedDoc) {
                console.log(deletedDoc)
                delRecursive(deletedDoc).then(function (val) {
                    console.log("Finished recursive function:" + val)
                    res.send(val)
                })
            } else {
                res.redirect("back")
            }
        }
    })
})


//update
//ajax
router.post("/folder/:folder_id/", (req, res) => {
    console.log("update request for folder")
    console.log(req.body)
    if (req.body) {
        Folder.findById(req.params.folder_id).populate("parentFolder").exec((err, foundfolder) => {
            if (err) {
                console.log("Error with updating/finding folder")
                console.log(err)
                res.send({
                    error: err
                })
            } else {
                fs.exists((foundfolder.path), (exists) => {
                    if (exists) {
                        console.log("time to change name")
                        fs.rename(foundfolder.path, foundfolder.parentFolder.path + req.body.folderName, (renameError) => {
                            if (renameError) {
                                console.log("Error encountered when trying to call FS rename")
                                res.send({
                                    error: renameError
                                })
                            } else {
                                console.log("rename successful, modifying folder information in MongoDB")
                                console.log("Before: " + foundfolder)
                                foundfolder.name = req.body.folderName
                                foundfolder.path = foundfolder.parentFolder.path + req.body.folderName
                                console.log("saving document")
                                foundfolder.save()
                                console.log("After: " + foundfolder)
                                res.send(foundfolder)
                            }
                        })
                    } else {
                        console.log("ERROR, folder DOES NOT EXIST")
                        res.send({
                            error: "folder path does not exist" + foundfolder.path
                        })
                    }
                })
            }
        })
    } else {
        console.log("Req.body does not exist")
        res.send({
            error: "No req.body found"
        })
    }
})



/*======================Move Folder Route=========================*/
router.put("/folder/:folder_id/", (req, res) => {
    console.log("MOVE FOLDER ROUTE")
    console.log(req.body)
    if (req.body) {
        Folder.findById(req.params.folder_id).populate("childFolders").populate("childFiles").populate("parentFolder").exec((err, folder) => {
            if (err) {
                console.log("Error Finding")
                console.log(err)
                res.send({ err: err })
            } else if(folder) {
                Folder.findById(req.body.destFolderID).populate("childFolders").exec((destErr, destFolder) => {
                    if (destErr) {
                        console.log(destErr)
                        res.send({ err: destErr })
                    } else {
                        console.log("Calling on FSE Move Function")
                        fs.move(folder.path, destFolder.path + folder.name)
                            .then(() => {
                                console.log('Success in moving. Time to modify the document')
                                folder.path = destFolder.path
                                console.log("find parent folder, pop the source folder")
                                var index
                                let promiseMoveFunct = []
                                Folder.findById(folder.parentFolder._id).populate("childFolders").exec((parentErr, parentFolder) => {
                                    if (parentErr) {
                                        console.log("ERROR finding parent folder")
                                        res.send({ err: parentErr })
                                    } else {
                                        //ERROR IN THIS INDEX
                                        index = parentFolder.childFolders.findIndex((element) => {
                                            console.log(element._id)
                                            return folder._id.equals(element._id)
                                        })
                                        console.log("index in parent folder: " + index)
                                        console.log("Removing source folder from parent folder")
                                        //parentFolder.childFolders.remove(index)
                                        parentFolder.childFolders.splice(index, 1)
                                        console.log(parentFolder)
                                        console.log("Right before calling save for parent folder")
                                        parentFolder.save()
                                        console.log("changing parent folder of course folder")
                                        folder.parentFolder = destFolder._id
                                        folder.path = destFolder.path + folder.name + "\\"
                                        folder.save()

                                        if (folder.childFolders) {
                                            folder.childFolders.forEach((fold) => {
                                                promiseMoveFunct.push(modifyDocAfterMove(fold, folder.path + fold.name))
                                            })
                                        }
                                        if (folder.childFiles) {
                                            folder.childFiles.forEach((file) => {
                                                promiseMoveFunct.push(modifyDocAfterMove(file, folder.path + file.name))
                                            })
                                        }
                                        Promise.all(promiseMoveFunct).then((result) => {
                                            console.log("Finished modifying document paths")
                                            console.log(result)
                                        })

                                        //foreach file 
                                        console.log("pushing source folder into dest child folder")
                                        destFolder.childFolders.push(folder._id)
                                        destFolder.save()
                                    }
                                })

                            })
                            .catch(moveErr => {
                                console.error(moveErr)
                                res.send({
                                    err: moveErr
                                })
                            })
                        res.send(folder)
                    }
                })
            }else{
                res.redirect("/")
            }
        })
    } else {
        res.send({
            err: "REQ.BODY NOT FOUND."
        })
    }
})

/*====================send folder information to client in move dialog=====================*/

router.post("/folder/:folder_id/move", (req, res) => {
    Folder.findById(req.params.folder_id).populate("childFolders").populate("childFiles").exec((err, foundFolder) => {
        if (err) {
            console.log("error")
            res.send({ err: err })
        } else {
            res.send(foundFolder)
        }
    })
})





/*=============FUNCTIONS FOR DELETION============== */

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
                if (doc.childFolders) {
                    doc.childFolders.forEach(function (folder) {
                        if (folder) {
                            console.log(folder)
                            console.log("Pushing recursive function into childFolderList Variable, id: " + folder._id)
                            childFolderList.push(delRecursive(folder))
                        }
                    })
                }
                if (childFolderList.length != 0) {
                    let fun = []
                    console.log("Child Folders Exist")
                    Promise.all(childFolderList).then(function (result) {
                        if (doc.childFiles) {
                            doc.childFiles.forEach((x) => {
                                console.log("pushing")
                                fun.push(delFile(x))
                            })
                            Promise.all(fun).then(function (val) {
                                fs.rmdir(doc.path, (rmDirErr) => {
                                    if (rmDirErr) {
                                        console.log("FS: deleting folder error")
                                        console.log(rmDirErr)
                                        reject("Failure: " + rmDirErr)
                                    } else {
                                        console.log("FS: Folder has been deleted successfully")
                                        resolve("Done:" + val)
                                    }
                                })
                            })
                        } else {
                            fs.rmdir(doc.path, (rmDirErr) => {
                                if (rmDirErr) {
                                    console.log("FS: deleting folder error")
                                    console.log(rmDirErr)
                                    reject("Failure: " + rmDirErr)
                                } else {
                                    console.log("FS: Folder has been deleted successfully")
                                    resolve("Done:" + doc.path)
                                }
                            })
                        }
                    })
                } else {
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
                            fs.rmdir(doc.path, (rmDirErr) => {
                                if (rmDirErr) {
                                    console.log("FS: deleting folder error")
                                    console.log(rmDirErr)
                                    reject("Failure: " + rmDirErr)
                                } else {
                                    console.log("FS: Folder has been deleted successfully")
                                    resolve("Done:" + doc.path)
                                }
                            })
                        })
                    } else {
                        console.log("No Child Files for: " + doc.path)
                        fs.rmdir(doc.path, (rmDirErr) => {
                            if (rmDirErr) {
                                console.log("FS: deleting folder error")
                                console.log(rmDirErr)
                                reject("Failure: " + rmDirErr)
                            } else {
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

/*========== FUNCTIONS FOR FILE MOVING ===============*/
function modifyDocAfterMove(doc, destPath) {
    return new Promise((resolve, reject) => {
        if (doc.path) {
            doc.path = destPath
            doc.save()
            resolve(doc)
        } else {
            reject(file)
        }
    })
}



module.exports = router