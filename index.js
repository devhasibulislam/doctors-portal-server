const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongoDB connectivity
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9gt71.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {
        client.connect();
        const servicesCollection = client.db("doctorsPortal").collection("services");
        console.log('doctors portal connected successfully!');
        
        // find services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            
            res.send(services);
        })
    } finally {
        client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Doctors Portal backend started!')
});

app.listen(port, () => {
    console.log(`Doctors Portal backend connected on port ${port}`)
});
