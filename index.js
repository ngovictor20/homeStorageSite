const app = require('express')()
const fs = require('fs');
const multer = require('multer')
const bodyParser = require('body-parser')
const ftp = require('basic-ftp')
const FtpSvr = require('ftp-srv')

var upload = multer();
//var file = require("./models/file")

const hostname = '0.0.0.0';
const port = 3000;

const ftpServer = new FtpSvr('ftp://0.0.0.0:9876')


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


//handlers for FTPSERVER
ftpServer.on('login', (data,resolve,reject)=>{
    console.log("logging data");
    console.log(data);
});






app.listen(port, hostname, ()=>{
    console.log("Listening on port 3000")
    ftpServer.listen().then(()=>{
	console.log("FTP Server running on port 21")
	example()
    })
})

async function example(){
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
	await client.access({
	    host:"localhost",
	    port:21,
	    user:"anonymous",
	    password: "test"
	})
	console.log(await client.list())

    }
    catch(err){
	console.log(err)
    }
    client.close()
}
