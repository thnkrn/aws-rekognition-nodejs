const AWS = require("aws-sdk");

AWS.config.update({region: "us-east-1"});

var cors = require("cors"),
  express = require("express"),
  bodyParser = require("body-parser"),
  aws = require("./index"),
  app = express();

AWS.config.loadFromPath("./credentials.json");

app.use(cors());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: true,credentials: true}));


process.env.AWS_REGION = 'us-east-1'

var rekognition = new AWS.Rekognition();
var server = app.listen();

server.setTimeout(500000);

// using this one
function compareRekFaces(SourceImage,TargetImage,cb){
  var params = {
    SimilarityThreshold: 90, 
    SourceImage: {
     Bytes: Buffer.from(SourceImage,"base64")
    }, 
    TargetImage: {
     Bytes: Buffer.from(TargetImage,"base64")
    }
   };
   rekognition.compareFaces(params, function(err, data) {
     if (err) console.log(err, err.stack); 
     else     console.log(data);           

     cb(data);
   });        
}

// using this one
app.post("/compare", function (req, res) {

  if((req.body.SourceImage.image && req.body.TargetImage.image) !==null ){

  const uploadedSourceImage = req.body.SourceImage.image;
  const uploadedTargetImage = req.body.TargetImage.image;

  req.setTimeout(500000);

  compareRekFaces(uploadedSourceImage,uploadedTargetImage, function(images){
    res.send(images);
  });

}



function indexRekFace(image, cb) {

  var params = {
    CollectionId: "facerek",
    Image: {
      Bytes: Buffer.from(image,"base64")
    }
  };


 rekognition.indexFaces(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
     } else {
      console.log(data);

      cb(data);
    }
  });
}

function searchByImage(image, cb) {

  var params = {
    CollectionId: "facerek",
    Image: {
      Bytes: Buffer.from(image,"base64")
    }
  };

  rekognition.searchFacesByImage(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
     } else {
      console.log(data);

      cb(data);
    }
  });
}

function deleteCollection(name){

  var params = {
    CollectionId: name
   };
   rekognition.deleteCollection(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
    });
  }

  app.post("/index", function (req, res) {

    if(req.body.image !==null ){

    const uploadedImage = req.body.image;

    req.setTimeout(500000);

    indexRekFace(uploadedImage, function(images){
      res.send(images)
    });

  }

  });



  app.post("/search", function (req, res) {

    if(req.body.image !==null ){

    const uploadedImage = req.body.image;

    req.setTimeout(500000);

    searchByImage(uploadedImage, function(images){
      res.send(images)
    });

    }

  });

  app.post("delete", function (req,res){
    if(req.body.name !== null){

      const collection = req.body.name;
      req.setTimeout(500000);

    
    deleteCollection(collection)

    }
  });

});

//listen
app.listen(8080);
console.log("App listening on port 8080");