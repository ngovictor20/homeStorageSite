const app = require('express')()
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const path = require("path");
var upload = multer();
var File = require("./models/files")
var Folder = require("./models/folder")
var fileRoute = require("./routes/files")
var folderRoute = require("./routes/folder")


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
	fs.appendFile("./uploads/"+req.file.originalname,req.file.buffer,(err)=>{
	    if(err){
		console.log("Ran into an error")
		console.log(err)
		throw err
	    }else{
		console.log("File is created")
	    }
	})
	res.json(req.file)
    }else{
	console.log("no files uploaded")
    }
})

app.get("/uploads",(req,res)=>{
    fs.readdir("./uploads",{
	//withFileTypes:true
    }, (err,files)=>{
	if(err){
	    throw(err)
	}else{
	    let fileList = []
	    console.log("returning files")
	    console.log(files)
	    //res.render("displayDrive",{dir:files})
	    files.forEach(function(x){
		fil = path.parse(x)
		fileList.push(
		    {
			filename: fil.name,
			ext: fil.ext,
			stats: fs.statSync("./uploads/"+x)
		    }
		)
	    })
	    console.log(fileList)
	    res.render("displayDrive",{dir:fileList})
	}
    })
})
//create folder
app.post("/uploads",(req,res)=>{
    
})



app.listen(port, hostname, ()=>{
    console.log("Listening on port 3000")
    console.log("Did i get out")
})

async function createFolder(pth){
    fs.mkdir(pth,(err)=>{
	if(err){
	    console.log(err)
	}else{
	    console.log("Creating folder")
	}
    })
}



async function listDir(pth){
    fs.readdir(pth,{
	withFileTypes:true
    }, (err,files)=>{
	if(err){
	    throw(err)
	}else{
	    console.log("returning files")
	    console.log(files)
	    return(files)
	}
    })
}
