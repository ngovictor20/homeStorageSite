var mongoose = require('mongoose');

var folderSchema = new mongoose.Schema({
    name:{
        type: String,
        default: "New Folder"
    },
    path:String,
    childFiles: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "File"
    },
    childFolders:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder"
    },
    parentFolder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder"
    }
})    



module.exports = mongoose.model("Folder",folderSchema)