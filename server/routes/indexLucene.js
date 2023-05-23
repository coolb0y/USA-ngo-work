const express = require('express');
const router = express.Router();
const java = require('java');
const LucenePath = 'C:/lucene-8.11.2/lucene-8.11.2'; // Path to the Lucene directory
const LuceneJAR = `${LucenePath}/core/lucene-core-8.11.2.jar`; // Path to the Lucene JAR file
const fs = require('fs');
const path = require('path');
var JSONStream = require('JSONStream');
const { Index } = require('meilisearch');
// Configure classpath to include Lucene JAR
java.classpath.push(LuceneJAR);

// Import necessary Java classes
const IndexWriter = java.import('org.apache.lucene.index.IndexWriter');
const Document = java.import('org.apache.lucene.document.Document');
const FieldType = java.import('org.apache.lucene.document.FieldType');
const TextField = java.import('org.apache.lucene.document.TextField');
const StandardAnalyzer = java.import('org.apache.lucene.analysis.standard.StandardAnalyzer');
const CorruptIndexException = java.import('org.apache.lucene.index.CorruptIndexException');
//const indexwriter = java.newInstanceSync(IndexWriter);
// Set up the Lucene index directory (can be RAMDirectory or FSDirectory)
// Set up the Lucene index directory (file system directory)
const FSDirectory = java.import('org.apache.lucene.store.FSDirectory');
const Path = java.import('java.nio.file.Paths');
const indexDirectory = FSDirectory.openSync(Path.getSync("C:/Users/gameS/OneDrive/Desktop/lucene-data"));
// Set up the configuration for the IndexWriter

const analyzer = java.newInstanceSync('org.apache.lucene.analysis.standard.StandardAnalyzer');
const iwc = java.newInstanceSync('org.apache.lucene.index.IndexWriterConfig', analyzer);
//const indexWriterConfig = java.newInstanceSync('org.apache.lucene.index.IndexWriterConfig', null);

// Create an IndexWriter with the specified directory and configuration
const indexWriter = java.newInstanceSync('org.apache.lucene.index.IndexWriter' ,indexDirectory, iwc);

// Define the route to index multiple documents
router.post('/', (req, res) => {
 // const documents = req.body; // Assuming the request body contains an array of documents
  let jsonpath = req.query.jsonpath;
  const indexname = req.query.indexname;
  const highWaterMark = 1024 * 50; // 50mb
  const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });

  const parser = JSONStream.parse('*');


 // parser.on('data', (documentData) => {
    // Index each document as it is parsed
    let documentData ={
        "id": "1",
        "title": "The Shawshank Redemption",
        "fileName": "The Shawshank Redemption",
        "fileType": "mp4",
        "fileSize": "1024",
        "url": "https://www.youtube.com/watch?v=6hB3S9bIaco",
        "fileDetails": "The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont, based on the 1982 Stephen King novella Rita Hayworth and Shawshank Redemption.",
        "artist": "Tim Robbins",
        "album": "The Shawshank Redemption",
        "track": "1",
        "duration": "142",
        "bitrate": "128",
        "length": "142",
        "width": "1280"

    }
    try {
     // Create a new document
    const document = java.newInstanceSync('org.apache.lucene.document.Document');

    // Create a field type
    const fieldType = java.newInstanceSync('org.apache.lucene.document.TextField');
    fieldType.setStoredSync(true);

    // Add fields to the document
    document.addSync(java.newInstanceSync(TextField, 'id', documentData.id || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'title', documentData.title || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'fileName', documentData.fileName || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'fileType', documentData.fileType || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'fileSize', documentData.fileSize || 0, fieldType));
    document.addSync(java.newInstanceSync(TextField, 'url', documentData.url || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'fileDetails', documentData.fileDetails || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'artist', documentData.artist || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'album', documentData.album || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'track', documentData.track || '', fieldType));
    document.addSync(java.newInstanceSync(TextField, 'duration', documentData.duration || 0, fieldType));
    document.addSync(java.newInstanceSync(TextField, 'bitrate', documentData.bitrate || 0, fieldType));
    document.addSync(java.newInstanceSync(TextField, 'length', documentData.length || 0, fieldType));
    document.addSync(java.newInstanceSync(TextField, 'width', documentData.width || 0, fieldType));

    // Add the document to the index
    indexWriter.addDocumentSync(document);
    } catch (e) {
      console.log(e);
    }
   //});

   parser.on('error', (err) => {
    console.error(err);
    return res.status(500).send({
      message: 'Error parsing the JSON file'
    });
   });

   readStream.pipe(parser);

   readStream.on('error', (err) => {
    console.error(err);
    return res.status(500).send({
      message: 'Error reading the JSON file'
    });
   });
    
   readStream.on('end', () => {
    // Perform the search after indexing is complete
    indexWriter.closeSync();

    return res.status(200).send({
      message: 'Indexing has enqueued successfully. Please wait for a few minutes.',
      
    });
    })


  // Iterate over the documents
 
});

module.exports = router;
