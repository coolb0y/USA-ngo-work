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
    //const filePath = jsonpath.replace(/['"]+/g, '');
    jsonpath =jsonpath.replace(/\\/g, '/');
    const jsonData = fs.readFileSync(jsonpath, 'utf-8');
    const parsedData = JSON.parse(jsonData);

    client.index(indexname).addDocuments(parsedData)
      .then(result =>{ 
        console.log(result)
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
