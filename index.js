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

            return res.send({ success: true, result });
        })

        // get all bookings
        app.get('/bookings', async (req, res) => {
            const patientEmail = req.query.email;
            const query = { patientEmail: patientEmail };
            const bookings = await bookingCollection.find(query).toArray();

            res.send(bookings);
        })

        /**
         * find bookings
         * this is not the proper way
         * it's risky but for learning purpose it's okay
         * should have to learn in advance way
         * after learning mongodb properly then do following:
         * use aggregate function, lookup, pipeline, match, group
        */
        app.get('/available', async (req, res) => {
            const date = req.query.date;

            /* step 1: find all services */
            const services = await serviceCollection.find({}).toArray();

            /* step 2: get the booking for that specific date */
            const query = { appointmentDate: date };
            const bookings = await bookingCollection.find(query).toArray();

            /* step 3: for each service find bookings for that service */
            services.forEach(service => {
                // step 1: get service bookings with respect services
                const serviceBookings = bookings.filter(booking => service.name === booking.treatmentName);
                // step 2: make a view of booked time for each service
                const booked = serviceBookings.map(serviceBooking => serviceBooking.appointmentTime);
                service.booked = booked;
                // step 3: display available time exclude booked one
                const available = service.slots.filter(svc => !booked.includes(svc));
                service.slots = available;
            })

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
