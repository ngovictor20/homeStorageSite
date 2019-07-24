const mongoose = require('mongoose')
var File = require("./models/files")
var Folder = require("./models/folder")
const fs = require('fs')




function seedDB() {
    let parent
    var promises = []
    Folder.findById("5d36456b1c9d440000bc296d", (err, doc) => {
        if (err) {
            console.log(err)
        } else {
            parent = doc
            fs.readdir(__dirname + "/uploads/", (err, files) => {
                files.forEach(function (x) {
                    promises.push(doAsync(x, doc))
                    // fs.lstat(__dirname+"/uploads/"+x,(err,stat)=>{
                    //     if(stat.isDirectory()){
                    //         console.log("create a folder model")
                    //         var folderSchema = {
                    //             name:x,
                    //             path:__dirname + "\\uploads\\" + x,
                    //             parentFolder: parent
                    //         }
                    //         Folder.create(folderSchema,(err,newFolder)=>{
                    //             if(err){
                    //                 console.log(err)
                    //             }else{
                    //                 console.log("Creating folder document")
                    //                 console.log(newFolder)
                    //                 doc.childFolders.push(newFolder)
                    //             }
                    //         })
                    //     }else if(stat.isFile()){
                    //         console.log("create a file model")
                    //         var fileSchema = {
                    //             name: x,
                    //             path: __dirname+"\\uploads\\"+x,
                    //             fileSize: stat.size,
                    //             parentFolder: parent
                    //         }
                    //         File.create(fileSchema,(err,newFile)=>{
                    //             if(err){
                    //                 console.log(err)
                    //             }else{
                    //                 console.log("Creating file document")
                    //                 console.log(newFile)
                    //                 doc.childFiles.push(newFile)
                    //             }
                    //         })
                    //     }

                    // })
                })
            })
            if(promises.length > 0){
                console.log("calling promise.all")
                Promise.all(promises).then(() => {
                    parent.save()
                })
            }
        }
        

    })

    
}


function doAsync(x, parent) {
    return new Promise((resolve,reject) => {
        fs.lstat(__dirname + "/uploads/" + x, (err, stat) => {
            if (stat.isDirectory()) {
                console.log("create a folder model")
                var folderSchema = {
                    name: x,
                    path: __dirname + "\\uploads\\" + x,
                    parentFolder: parent
                }
                Folder.create(folderSchema, (err, newFolder) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        console.log("Creating folder document")
                        console.log(newFolder)
                        parent.childFolders.push(newFolder)
                        resolve(newFolder)
                    }
                })
            } else if (stat.isFile()) {
                console.log("create a file model")
                var fileSchema = {
                    name: x,
                    path: __dirname + "\\uploads\\" + x,
                    fileSize: stat.size,
                    parentFolder: parent
                }
                File.create(fileSchema, (err, newFile) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        console.log("Creating file document")
                        console.log(newFile)
                        parent.childFiles.push(newFile)
                        resolve(newFile)
                    }
                })
            }

        })
    })
}

module.exports = seedDB