
import express  from "express"
import { MongoClient } from 'mongodb';

const app = express()
const PORT =8000;


const client = new MongoClient("mongodb://neighboraid-server:t6Xia0XLlfh7zsV5@ac-szqteue-shard-00-00.khjwenv.mongodb.net:27017,ac-szqteue-shard-00-01.khjwenv.mongodb.net:27017,ac-szqteue-shard-00-02.khjwenv.mongodb.net:27017/?ssl=true&replicaSet=atlas-s2669c-shard-0&authSource=admin");

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

connectToMongoDB()

// http://localhost:8000

app.get('/', (req,res) => {
    res.send({message: 'Server is running fine'})
})


app.listen(PORT, () => {
    console.log(`Server is running at ,OK ${PORT}`);
})