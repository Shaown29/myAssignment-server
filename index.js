const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3u96.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run (){
    try{
        await client.connect();
        const database = client.db('refrigerator_shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders'); 
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');
        
        //Get Products Api
        app.get('/products',async(req,res)=>{
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        app.post('/products', async(req,res) =>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);
        });
        app.delete('/products/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await productCollection.deleteOne(query);
            res.json(result);
        })
           

        //Order Related Work
        app.post('/orders',async(req,res)=>
        {
            const order=req.body;
            const result=await orderCollection.insertOne(order);
            res.json(result);
            
        });
        app.post('/single-order',async(req,res)=>  {
            const query= {email: req.body.email};
            const order=await orderCollection.findOne(query);
            res.json(order);
        });
        app.delete('/orders/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await orderCollection.deleteOne(query);
            res.json(result);
        })
            
        //Users Post
        app.get('/user/:email', async(req,res) =>{
            const email = req.params.email;
            const query = {email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            } 
            res.json({ admin: isAdmin });
        })

        app.post('/users', async(req,res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });


        app.put('/users/admin', async(req, res)=>{
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        // reviews
        app.post('/reviews', async(req,res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        
        app.get('/reviews',async(req,res)=>{
            const cursor = reviewCollection.find({});
            const reviewShow = await cursor.toArray();
            res.send(reviewShow);
        })


    }
    finally{
        //await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Assignment-12 is running');
});
app.listen(port,()=>{
    console.log('Server running at port',port)
})