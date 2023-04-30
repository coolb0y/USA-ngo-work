const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const { MeiliSearch } = require('meilisearch');

router.get('/', (req, res) => {
  const client = new MeiliSearch({
    host: "http://localhost:7700"
    // apiKey: "your_master_api_key_here"
  });
  try{
    let jsonpath = req.query.jsonpath;
    const indexname = req.query.indexname;

        console.log(jsonpath);
        console.log(indexname);

        // Read the contents of the JSON file
        jsonpath = jsonpath.replace(/\\/g, '/');
        const highWaterMark = 1024*50 ; //50kb

        let jsonData = '';
        const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });

        readStream.on('data', (chunk) => {
          console.log(chunk,'chunk')
          jsonData = chunk;
          let parsedData = JSON.parse(jsonData);
          client.index(indexname).addDocuments(parsedData)
          .then(result =>{ 
            console.log(result)
            
         })
        .catch(err => {
           console.error(err);
         return res.status(500).send({
         message: 'Error indexing the data'
        })
        });
          
        });

        readStream.on('end', () => {
        
          return res.status(200).json({
            message: 'Indexing has enqued successfully Please wait for few minutes'
          }); // Send back the parsed JSON data
         
});

readStream.on('error', (err) => {
  console.error(err);
  return res.status(500).send({
      message: 'Error reading the JSON file'
  })
});

  }
  catch(e){
    console.log(e);
  }
})

module.exports = router;
