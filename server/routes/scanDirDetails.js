const router = require("express").Router();
const fs = require("fs-extra");
const path = require('path');
let mime = require('mime-types')
const { convert } = require('html-to-text');
const pdf = require('pdf-parse');
require('dotenv').config();
const { 
    v4: uuidv4,
  } = require('uuid');
const cheerio = require('cheerio');
const WordExtractor = require("word-extractor"); 

const ExifParser = require('exif-parser');
const ExifReader = require('exifreader');
var ffmpeg = require('ffmpeg');


// Read Word document



const options = {
    ignoreHref: true, // ignore <a> tags and their content
    ignoreImage: true, // ignore <img> tags and their content
    noLinkBrackets: true, // do not add square brackets around links
    preserveNewlines: false, // preserve newlines in the text
    noLinkBrackets: true,
    ignoreHref: true,
    wordwrap: 1,
    ignoreImage: true,
    encodeCharacters:{"\n":" ",
    "\n\n":" ",
    "\n\n\n":" ",
    "\n\n\n\n":" ",
    "\n\n\n\n\n":" ",
    "\n\n\n\n\n\n":" ",
    "\n\n\n\n\n\n\n":" ",
    "\n\n\n\n\n\n\n\n":" ",
    "/":" ",
    "\\": " ",
    "(": " ",
    ")": " ",
    "[": " ",
    "]": " ",
    "\r":" ",
    "\t":" ",
    "\f":" ",
    "\v":" ",
    "\u00A0":" ",
    "*":" "},
    whitespaceCharacters: '\t\r\n',
    selectors: [
        { selector: 'a', format: 'skip'},
        { selector: 'img', format: 'skip'},
        { selector: 'script', format: 'skip'},
        { selector: 'style', format: 'skip'},
        { selector: 'br', options:{itemPrefix: " "} },
        {selector:'header',format:'skip'},
        {selector:'footer',format:'skip'},
        { selector: 'ul', options: { itemPrefix: " " }},
        { selector: 'ol', options: { itemPrefix: " " }},
       // { selector: 'li', options: { itemPrefix: " " }},
        { selector: 'p', options: { itemPrefix: " " }},
        { selector: 'h1', options: { itemPrefix: " " }},
        { selector: 'h2', options: { itemPrefix: " " }},
        { selector: 'h3', options: { itemPrefix: " " }},
        { selector: 'h4', options: { itemPrefix: " " }},
        { selector: 'h5', options: { itemPrefix: " " }},
        { selector: 'h6', options: { itemPrefix: " " }},
        { selector: 'table', options: { itemPrefix: " " }},
       // { selector: 'tr', options: { itemPrefix: "" }},
        //{ selector: 'td', options: { itemPrefix: "" }},
        //{ selector: 'th', options: { itemPrefix: "" }},
        //{ selector: 'title', options: { itemPrefix: "" }},
      ],
      decodeEntities: true,


  
   
  };


  

// Recursive function to scan directory
async function scanDirectory(dirPath, fileNames) {
    try {
      const files = await fs.readdir(dirPath);
      await Promise.all(
        files.map(async function (file) {
          let filePath = path.join(dirPath, file);
          let stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
          
           
            await scanDirectory(filePath, fileNames);
          } else {
            // Handle file here
            
            let fileName = file;
            let fileDetails = "";
            let filetype = "";
            let filesize= stats.size;
            let id = uuidv4();
           
            
            
            const index = filePath.indexOf('chipster');
            const hostname = filePath.slice(index + 9).split('\\')[0];
            baseurl = "http://"+hostname;
           
            const startIndex = filePath.indexOf(hostname) + hostname.length;
            const pathAfterDomain = filePath.substring(startIndex).replace(/\\/g, '/');
          
            let url= baseurl + pathAfterDomain;
           
            try {
              filetype = mime.lookup(filePath);
              
             
            } catch (err) {
                console.log(err);
              throw new Error(err);
            }
  
            if (filetype === "text/html") {
              try {
                const html = await fs.readFile(filePath, 'utf-8');
                const $ = cheerio.load(html);

                // Extract the title
                let title = $('title').text().replace(/[\n\/\\><-]+|\s+/g, ' ');
               if(title===undefined|| title==null || title==""){
                    title="No Title Description Exists"
               }

                
                const text = convert(html, options);
                let cleanedText = text.replace(/[\n\/\\><-]+|\s+/g, ' ');
               
                //console.log(text);
                fileNames.push({id:id,title:title, fileName: fileName, fileType: "html",fileSize:filesize,url:url, fileDetails: cleanedText });
                
              } catch (err) {
                console.error('Failed to read HTML file:', err);
                throw new Error("Failed to read HTML file");
              }
            }
             else if (filetype === "image/jpeg" || filetype === "image/png" || filetype==="image/jpg") {
             
              // this code works as well it is able to extract metadata height and stuff as well as advance things
              try{
                // const imageBuffer = fs.readFileSync(filePath);

                // // Create ExifParser instance and parse image buffer
                // const parser = ExifParser.create(imageBuffer);
                // const result = parser.parse();
                // //console.log(result,'result');
              
                const result = await ExifReader.load(filePath);
                //console.log(result);
                 let imgtitle="";
                let imgtags="";
                let imageWidth= result?result.ImageWidth?result.ImageWidth.value:0:0;
                let imageLength=result?result.ImageLength?result.ImageLength.value:0:0;
                let imageDescription="";

                if(result){
                  if(result.ImageDescription){
                   
                    imageDescription =result.ImageDescription.value.toString('utf16le').replace(/[\n\/\\><-]+|\s+/g, ' ');
                  }

                  if(result.title){
                   
                    imgtitle = result.title.description.replace(/[\n\/\\><-]+|\s+/g, ' ');
                  }
                 if(result.subject){
                 
                  imgtags = result.subject.description.replace(/[\n\/\\><-]+|\s+/g, ' ');
                 }
                 
                
                 
                }

                 fileNames.push({id:id,title:imgtitle, fileName: fileName, fileType: "image",fileSize:filesize,url:url, fileDetails: imageDescription,imagesize:{imageLength,imageWidth},imgtags:imgtags })
                 
              }

              catch(e){
                console.log(e);
                throw new Error("Failed to read image file");
              }
                
      
            }

            // else if(filetype==="image/gif"){
            //   try{
                          
            

            //   }
            // catch(e){
            //   console.log(e);
            //   throw new Error("Something went wrong with image");
            // }
            // }

            else if(filetype=="video/x-matroska"){
              try {
                var process = new ffmpeg(filePath);
                process.then(function (video) {
                  // Video metadata
                 // console.log(video.metadata);
                  // FFmpeg configuration
                 
                  let title="";
                  let artist="";
                  let album="";
                  let genre="";
                  let track="";
                  let codec="";
                  let duration=0;
                  let bitrate=0;
                  let resoultion={};
                  let fps=0;
                  let audiocodec="";
                  let audiochannels=0;
                  let audiobitrate=0;
                  let audiosamplerate=0;
                  if(video.metadata){
                    title=video.metadata.title?video.metadata.title:"";
                    artist=video.metadata.artist?video.metadata.artist:"";
                    album=video.metadata.album?video.metadata.album:"";
                    track=video.metadata.track?video.metadata.track:"";
                    codec=video.metadata.video.codec?video.metadata.video.codec:"";
                    duration=video.metadata.duration.seconds?video.metadata.duration.seconds:0;
                    bitrate=video.metadata.video.bitrate?video.metadata.video.bitrate:0;
                    resoultion=video.metadata.video.resolution?video.metadata.video.resolution:{};
                    fps=video.metadata.video.fps?video.metadata.video.fps:0;
                    audiocodec=video.metadata.audio.codec?video.metadata.audio.codec:"";
                    audiochannels=video.metadata.audio.channels?video.metadata.audio.channels:0;
                    audiobitrate=video.metadata.audio.bitrate?video.metadata.audio.bitrate:0;
                    audiosamplerate=video.metadata.audio.sample_rate?video.metadata.audio.sample_rate:0;

                    fileNames.push({id:id,title:title, fileName: fileName,artist:artist,album:album,track:track, fileType: "video",fileSize:filesize,url:url, codec:codec,duration:duration,bitrate:bitrate,resoultion:resoultion,fps:fps,audiocodec:audiocodec,audiochannels:audiochannels,audiobitrate:audiobitrate,audiosamplerate:audiosamplerate });
                 }
                }, function (err) {
                  console.log('Error: ' + err);
                });
              } catch (e) {
                console.log(e.code);
                console.log(e.msg);
              }
            }
             else if (filetype === "application/pdf") {
              try{
                let dataBuffer =await fs.readFile(filePath);
                const data = await pdf(dataBuffer)
                let cleanedData = data.text.replace(/[\n\/\\><-]+|\s+/g, ' ');
                //console.log(cleanedData);
                let title="No Title Description Exists";
                //const dataobj ={id:id,title:title, fileName: fileName, filetype: filetype,fileSize:filesize,url:url, fileDetails: cleanedData };
                fileNames.push({id:id,title:title, fileName: fileName, filetype: "pdf",fileSize:filesize,url:url, fileDetails: cleanedData }); 
            
              }
              catch(e){
                console.log(e);
                throw new Error("Failed to read PDF file");
              }
            }
             else if (filetype === "text/plain") {
            try{
              fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) throw err;
                else{
                  let cleanedData = data.replace(/[\n\/\\><-]+|\s+/g, ' ');
                  let title = cleanedData.substring(0, 30);
                  fileNames.push({id:id,title:title, fileName: fileName, filetype: "text",fileSize:filesize,url:url, fileDetails: cleanedData });
                 // console.log(data);
                }
                
              });  
            }

            catch(e){
              console.log(e);
              throw new Error("Failed to read text file");
            }
           
            }
             else if (filetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || filetype === "application/msword") {
             
              try{
                console.log(filetype);
                console.log(filePath)
                const extractor = new WordExtractor();
                const extracted = extractor.extract(filePath);
                await extracted.then(doc => {
                   
                    let cleanedData = doc.getBody().replace(/[\n\/\\><-]+|\s+/g, ' ');
                    let title = cleanedData.substring(0, 30);
                    fileNames.push({id:id,title:title, fileName: fileName, filetype: "doc-docx",fileSize:filesize,url:url, fileDetails: cleanedData });
                   
                  })
                  
              }
              catch(e){
                console.log(e);
                throw new Error("Failed to read Word file");
              }
             

            }

          }
        })
      );
    } catch (err) {
      console.error('Failed to read directory:', err);
      throw new Error("Failed to read directory");
    }
  }

router.get("/", (req, res) => {
  let dirPath = req.query.dirPath;

  let outputname  = req.query.outputName; 
  let finaloutput = __dirname+"/../output_json/" + outputname + '.json';
 
  let fileNames = [];

  scanDirectory(dirPath, fileNames)
    .then(() => {
      // Directory scanning completed
      fs.writeFile(finaloutput, JSON.stringify(fileNames), (err) => {
        if (err) {
          console.error("Unable to write file names to JSON file", err);
         return res.status(500).json({
            message:"Unable to write file names to JSON file"
          });
        } else {
         
          return res.status(200).json({
            message:"Directory scanned successfully and file names written to json file"
          });
        }
      });
    })
    .catch((err) => {
      console.error("Unable to scan directory", err);
      return res.status(500).json({
        message:"Unable to scan directory"
      });
    });
});

module.exports = router;
