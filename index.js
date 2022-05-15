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
        const serviceCollection = client.db("doctorsPortal").collection("services");
        const bookingCollection = client.db("doctorsPortal").collection("bookings");
        console.log('doctors portal connected successfully!');

        /**
         * API naming convention
         * app.get('/bookings') // get all bookings within a specific collection
         * app.get('/booking/:id') // get a specific booking within a specific collection
         * app.post('/booking') // add a new booking within a specific collection
         * app.patch('/booking/:id') // update a specific booking within a specific collection
         * app.delete('/booking/:id') // delete a specific booking from a specific collection
        */

        // find services
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();

            res.send(services);
        })

        // add new booking
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatmentName: booking.treatmentName, patientName: booking.patientName, appointmentDate: booking.appointmentDate };
            const existBooking = await bookingCollection.findOne(query);

            if (existBooking) {
                return res.send({ success: false, result: existBooking });
            }

            const result = await bookingCollection.insertOne(booking);

            return res.send({success: true, result});
        })

        // find bookings
        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();

            res.send(bookings);
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
