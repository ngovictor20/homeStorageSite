var mongoose = require('mongoose');

var folderSchema = new mongoose.Schema({
    path:String,
    childFiles: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "File"
    }
})    



module.exports = mongoose.model("Folder",folderSchema)