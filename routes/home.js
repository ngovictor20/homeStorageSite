var express = require("express");
var router = express.Router();
var multer = require("multer")
var upload = multer();
const fs = require("fs")

function getDirContents() {
	fs.readdir("./uploads", {
		withFileTypes:true
	}, (err, files) => {
		if (err) {
			throw (err)
		} else {
			let fileList = []
			console.log("returning files")
			console.log(files)
			//res.render("displayDrive",{dir:files})
			files.forEach(function (x) {
				fil = path.parse(x)
				fileList.push(
					{
						filename: fil.name,
						ext: fil.ext,
						stats: fs.statSync("./uploads/" + x)
					}
				)
			})
			console.log(fileList)
			res.render("displayDrive", { dir: fileList })
		}
	})
}

module.exports = router;