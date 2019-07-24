const app = require('express')()
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require("path");
var upload = multer();
var File = require("./models/files")
var Folder = require("./models/folder")
var fileRoute = require("./routes/files")
var folderRoute = require("./routes/folder")
var homeRoute = require("./routes/home")
const uri = "mongodb+srv://victoradmin:Harpie25@checklistapp-afjm1.mongodb.net/storageApp?retryWrites=true&w=majority"
const seedDB = require("./seed")
const hostname = '0.0.0.0';
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(homeRoute)
app.use(fileRoute)
app.use(folderRoute)



mongoose.connect(uri, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log(err)
        throw (err)
    } else {
        console.log('established connection with database')
    }
})

seedDB()


app.listen(port, hostname, () => {
    console.log("Listening on port 3000")
    console.log("Did i get out")
})


async function listDir(pth) {
    fs.readdir(pth, {
        withFileTypes: true
    }, (err, files) => {
        if (err) {
            throw (err)
        } else {
            console.log("returning files")
            console.log(files)
            return (files)
        }
    })
}