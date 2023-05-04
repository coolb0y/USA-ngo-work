const router = require('express').Router();
const fs = require('fs');
const path = require('path');
var JSONStream = require('JSONStream');
const { MeiliSearch } = require('meilisearch');
const { count } = require('console');
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
    
    const highWaterMark = 1024 * 1024; //500kb
    const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });
    
    const parser = JSONStream.parse('*');
    let count1 = 0;
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    const docadd = async function(data){
       await client.index(indexname).addDocuments(data)
        .then(result =>{ 
           count1 = 0;
          console.log(result)
        })
        .catch(async(err) => {
            count1 = count1 +1;
            //five retries for data indexing
            if(count1<5){
                try{
                    await sleep(10000*count1) //10 second delay
                    await docadd(data)
                    count1 = 0;
                }
                catch(e){
                    console.log(e)
                }
              
            }
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
