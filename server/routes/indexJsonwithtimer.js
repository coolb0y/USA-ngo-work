const router = require('express').Router();
const fs = require('fs');
const path = require('path');
var JSONStream = require('JSONStream');
const { MeiliSearch } = require('meilisearch');



const amqp = require("amqplib");
var channel, connection;


connectQueue() // call connectQueue function
async function connectQueue() {
    try {

        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel()
        
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("test-queue")
        
    } catch (error) {
        console.log(error)
    }
}

const sendData = async (data) => {
    // send data to queue
    await channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(data)));
        
    // close the channel and connection
    //await channel.close();
    //await connection.close();
}



const client = new MeiliSearch({
    host: "http://localhost:7700",
    // apiKey: "KE2o7rxeCWFnCmZmvVFF31gEFYb2vfdLyAaHkQ-2C3g"
  });


router.get('/', (req, res) => {

  try{
    let jsonpath = req.query.jsonpath;
    const indexname = req.query.indexname;
    
    client.index(indexname).updateSettings({
    
        distinctAttribute: 'url',
        searchableAttributes: [
            'title',
            'fileDetails',
            'artist',
            'album',
        ],
        filterableAttributes: ['fileType','fileSize','duration','bitrate','width','fps','audioChannels','audioBitrate','audioSamplerate','codec','audioCodec','resolution','imgtags','baseurl'],
        typoTolerance: {
            'minWordSizeForTypos': {
                'oneTypo': 4,
                'twoTypos': 8
            }
        },
        pagination: {
            maxTotalHits: 5000
        },
        faceting: {
            maxValuesPerFacet: 200
        }
    })


    console.log(jsonpath);
    console.log(indexname);

    jsonpath = jsonpath.replace(/\\/g, '/');
    
    const highWaterMark = 1024 * 1024*5; //5mb
    const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });
    
    const parser = JSONStream.parse('*');
    let count1 = 0;
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    const docadd = async function(data){
       await client.index(indexname).addDocuments(data, { batchSize:500 })
        .then(result =>{ 
           
          console.log(result)
        })
        .catch(async(err) => {
            
            sendData(data);
            //five retries for data indexing
          
           //await sleep(1*count1) //10 second delay
       
          console.error(err);
        });
    }

    parser.on('data',async (data) => {
      // Index each document as it is parsed
      try{
       await docadd(data);
      }
      catch(e){
    
        console.log(e);
      }
     
    
    });
    
    parser.on('error', (err) => {
      console.error(err);
      return res.status(500).send({
        message: 'Error parsing the JSON file'
      })
    });
    
    readStream.pipe(parser);
    
    readStream.on('error', (err) => {
      console.error(err);
      return res.status(500).send({
        message: 'Error reading the JSON file'
      })
    });
    
    readStream.on('end', () => {
      return res.status(200).send({
        message: 'Indexing has enqued successfully Please wait for few minutes'
      })
    });
    

  }
  catch(e){
    console.log(e);
  }
})

module.exports = router;
