var express = require("express");
var router = express.Router();
var multer = require("multer")
var upload = multer();
const fs = require("fs")

router.get("/", (req, res) => {
	getDirContents()
	res.render("./home");
})

router.post("/", upload.single('file'), (req, res) => {
	//handle file uploading
	//console.log(req)
	if (req.file) {
		console.log(req.file)
		fs.appendFile("./uploads/" + req.file.originalname, req.file.buffer, (err) => {
			if (err) {
				console.log("Ran into an error")
				console.log(err)
				throw err
			} else {
				console.log("File is created")
			}
		})
		res.json(req.file)
	} else {
		console.log("no files uploaded")
	}
})

router.get("/uploads", (req, res) => {

})



//create folder
router.post("/uploads", (req, res) => {

})


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