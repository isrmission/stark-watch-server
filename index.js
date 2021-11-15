const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;



const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ttsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('stark_watch');
        const ordersCollection = database.collection('orders');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const reviewesCollection = database.collection('reviewes');

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            // console.log(query)
            const cursor = ordersCollection.find(query);
            const orderlist = await cursor.toArray();
            res.json(orderlist);
        });

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find();
            const products = await cursor.toArray();
            res.send(products);
        });


        app.get('/allorders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            // console.log(orders)
            res.json(orders);
        });

        app.get('/allreviews', async (req, res) => {
            const cursor = reviewesCollection.find({});
            const reviews = await cursor.toArray();
            // console.log(reviews)
            res.json(reviews);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            // console.log(result)
            res.json(result)
        });

        app.post('/reviewes', async (req, res) => {
            const review = req.body;
            const result = await reviewesCollection.insertOne(review);
            // console.log(result)
            res.json(result)
        });

        app.post('/addproduct', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            // console.log(result)
            res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result)
            res.json(result)
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        });

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query)
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // console.log(query)
            const result = await productsCollection.deleteOne(query);
            res.json(result);

        });


    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello STARK Watch!')
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})