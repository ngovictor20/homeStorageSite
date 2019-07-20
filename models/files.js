var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    fileName: String,
    path: String,
    mimeType: String,
    encoding: String,
    originalName: String,
    fileSize: String,
    parentFolder: String
})    



module.exports = mongoose.model("File",fileSchema)