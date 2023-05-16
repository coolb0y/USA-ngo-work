const router = require('express').Router();
const fs = require('fs');
const path = require('path');
var JSONStream = require('JSONStream');
const elasticlunr = require('elasticlunr');
router.get('/', (req, res) => {

  try {
    let jsonpath = req.query.jsonpath;
    const indexname = req.query.indexname;

    jsonpath = jsonpath.replace(/\\/g, '/');

    const highWaterMark = 1024 * 50; // 50mb
    const readStream = fs.createReadStream(jsonpath, { highWaterMark, encoding: 'utf-8' });

    const parser = JSONStream.parse('*');
    

    // var idx = elasticlunr(function () {
    //   this.addField('id')
    //   this.addField('title')
    //   this.addField('fileType')
    //   this.addField('url')
    //   this.addField('fileDetails')
    //   this.addField('artist')
    //   this.addField('album')
    //   this.addField('duration')
    //   this.addField('bitrate')
    //   this.addField('length')
    //   this.addField('width')
    //   this.addField('imgtags')
    //   this.addField('imgtitle')
    //   this.setRef('id');
    // });
    var indexDump = JSON.parse(fs.readFileSync('./example_index.json', 'utf8'))
    console.time('load')
    let idx = elasticlunr.Index.load(indexDump)
    const result = idx.search("love");
       console.log(result, 'result');
    // parser.on('data', (data) => {
    //   // Index each document as it is parsed
    //   try {
    //     console.log(data)
    //     idx.addDoc(data);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // });

    // parser.on('error', (err) => {
    //   console.error(err);
    //   return res.status(500).send({
    //     message: 'Error parsing the JSON file'
    //   });
    // });

    // readStream.pipe(parser);

    // readStream.on('error', (err) => {
    //   console.error(err);
    //   return res.status(500).send({
    //     message: 'Error reading the JSON file'
    //   });
    // });

    // readStream.on('end', () => {
    //   // Perform the search after indexing is complete
    //   const result = idx.search("love");
    //   console.log(result, 'result');

    //   fs.writeFile('./example_index.json', JSON.stringify(idx), function (err) {
    //     if (err) throw err;
    //     console.log('done');
    //   });

    //   return res.status(200).send({
    //     message: 'Indexing has enqueued successfully. Please wait for a few minutes.',
    //     searchResult: result
    //   });
    // });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
