const app = require('express')()
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
var upload = multer();
var file = require("./models/file")

const hostname = '0.0.0.0';
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views',__dirname+'/views');
app.set('view engine', 'ejs');


app.get("/",(req,res)=>{
	res.render("home");

})

app.post("/",upload.single('file'),(req,res) =>{
	//handle file uploading
	//console.log(req)
	if(req.file){
		console.log(req.file)
		res.json(req.file)
	}else{
		console.log("no files uploaded")
		res.send("post request for file upload, no file uploaded")
	}
})

app.listen(port, hostname, ()=>{
	console.log("Listening on port 3000")
})
