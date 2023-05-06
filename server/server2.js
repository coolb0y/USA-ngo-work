const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;
const { MeiliSearch } = require('meilisearch');
const amqp = require("amqplib");
var channel, connection;

const client = new MeiliSearch({
    host: "http://localhost:7700",
    // apiKey: "KE2o7rxeCWFnCmZmvVFF31gEFYb2vfdLyAaHkQ-2C3g"
  });

  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
connectQueue() // call connectQueue function
async function connectQueue() {
    try {

        connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel()
        
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("test-queue")
        
        channel.consume("test-queue",async (data) => {
            // console.log(data)
            console.log("Data received : ", `${Buffer.from(data.content)}` );

            await client.index(indexname).addDocuments(data)
            .then(result =>{ 
                channel.ack(data)
              console.log(result)
            })
            .catch(async(err) => {
                
                await channel.nack(data) //five retries for data indexing
                //five retries for data indexing
                await sleep(10)
              // await sleep(1*count1) //10 second delay
           
              console.error(err);
            });
            
        })

    } catch (error) {
        console.log(error)
    }
}

app.listen(PORT, () => console.log("Server running at port " + PORT));