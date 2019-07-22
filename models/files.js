var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    name: String,
    path: String,
    fileSize: String,
    parentFolder: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder"
    }
})



module.exports = mongoose.model("File",fileSchema)