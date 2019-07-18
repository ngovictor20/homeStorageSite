var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    mimetype: String,
    encoding: String,
    originalname: String,
    filesize: String
})    



module.exports(mongoose.model("File",fileSchema))