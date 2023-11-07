const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); // Import the Prisma client

const prisma = new PrismaClient(); // Create an instance of the Prisma client

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', extended: true, parameterLimit: 50000 }));

// API to create a new user
app.post('/createUser', async (req, res) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                points: req.body.points,
            },
        });
        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// API to retrieve all users
app.get('/getUsers', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving users' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
