const fs = require('fs');
const path = require('path');
var JSONStream = require('JSONStream');


var host = 'localhost';
var protocol = 'http';
var port = 9200;
var auth = 'admin:admin'; // For testing only. Don't store credentials in code.
var ca_certs_path = "C:/Users/gameS/Downloads/opensearch-2.7.0-windows-x64/opensearch-2.7.0/config/root-ca.pem";

// Optional client certificates if you don't want to use HTTP basic authentication.
// var client_cert_path = '/full/path/to/client.pem'
// var client_key_path = '/full/path/to/client-key.pem'

// Create a client with SSL/TLS enabled.
var { Client } = require('@opensearch-project/opensearch');
const { create } = require('./models/data');

var client = new Client({
  node: protocol + '://' + auth + '@' + host + ':' + port,
  ssl: {
    ca: fs.readFileSync(ca_certs_path),
     rejectUnauthorized: false // if you're using self-signed certificates with a hostname mismatch.
    // cert: fs.readFileSync(client_cert_path),
    // key: fs.readFileSync(client_key_path)
  },
});


console.log('Creating index:');

var index_name = 'ngodatatest4';
var response;

const mapping = {
  properties: {
    title: {
      type: 'text', // Make the "title" field text searchable
    },
    imagetags: {
      type: 'text', // Make the "title" field text searchable
    },
    baseurl: {
      type: "keyword", // Make the "category" field filterable
    },
    filetype:{
      type: 'keyword', // Make the "category" field filterable
    },
   
  },
};

const createIndex =async ()=>{
  response = await client.indices.create({
    index: index_name,
    body: {
      mappings: mapping,
    },
  });
}

createIndex();



const jsonpath = "C:/Users/gameS/OneDrive/Desktop/allsmallname.json";
const highWaterMark = 1024 * 50; //50mb
const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });

const parser = JSONStream.parse('*');



parser.on('data',async (data) => {
  // Index each document as it is parsed

  var response = await client.index({
  
    index: index_name,
    body: data,
  });
  console.log(response)
});

parser.on('error', (err) => {
  console.error(err);
  
});

readStream.pipe(parser);

readStream.on('error', (err) => {
  console.error(err);
 
});

readStream.on('end', () => {
  console.log("indexing done")
});




