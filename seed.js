const mongoose = require('mongoose')
var File = require("./models/files")
var Folder = require("./models/folder")
const fs = require('fs')

async function seedDB() {
    var promises = []
    var rootFolder = await createThing()
    console.log(rootFolder)
    fs.readdir(__dirname + "/uploads/", (err, files) => {
        files.forEach(function (x) {
            promises.push(doAsync(x, rootFolder))
        })
        if (promises.length > 0) {
            console.log("calling promise.all")
            Promise.all(promises).then(() => {
                rootFolder.save()
            })
        }
        
    })
    
}

function createThing() {
    console.log("create thing")
    return new Promise((resolve, reject) => {
        Folder.create({
            name: "uploads", path: "D:\\NodeJS Projects\\storageApp\\uploads\\"
        }, (err, newFolder) => {
            console.log("finished creating folder")
            resolve(newFolder)
        })
    })
}


// function seedDB() {
//     let parent
//     var promises = []
//     parent = doc
//     fs.readdir(__dirname + "/uploads/", (err, files) => {
//         files.forEach(function (x) {
//             promises.push(doAsync(x, doc))
//         })
//     })
//     if (promises.length > 0) {
//         console.log("calling promise.all")
//         Promise.all(promises).then(() => {
//             parent.save()
//         })
//     }
// }


// function iterateFolder(parent) {
//     fs.readdir(__dirname + "/uploads/", (err, files) => {
//         files.forEach(function (x) {
//             fs.lstat(__dirname + "/uploads/" + x,(err,stat)=>{
//                 if(stat.isFile()){
//                     fileArray.push({
//                         name: x,
//                         path: __dirname + "\\uploads\\" + x,
//                         parentFolder: parent
//                     })
//                 }else if(stat.isDirectory()){
//                     folderArray.push({
//                         name: x,
//                         path: __dirname + "\\uploads\\" + x,
//                         fileSize: stat.size,
//                         parentFolder: parent
//                     })
//                 }
//             })
//         })
//     })
//     console.log({
//         filearray: fileArray,
//         folderarray: folderArray
//     })
//     return({
//         filearray: fileArray,
//         folderarray: folderArray
//     })
// }






function doAsync(x, parent) {
    return new Promise((resolve, reject) => {
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
                        parent.childFolders.push(newFolder._id)
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
                        parent.childFiles.push(newFile._id)
                        resolve(newFile)
                    }
                })
            }

        })
    })
}

module.exports = seedDB