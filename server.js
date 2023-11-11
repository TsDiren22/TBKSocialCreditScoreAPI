const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

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

// Fuse two users and merge their messages into one user
app.post('/fuseUsers', async (req, res) => {
    try {
        const userId1 = req.body.userId1;
        const userId2 = req.body.userId2;

        // Find the users by their IDs
        const user1 = await prisma.user.findUnique({
            where: { id: userId1 },
        });

        const user2 = await prisma.user.findUnique({
            where: { id: userId2 },
        });

        if (!user1 || !user2) {
            res.status(404).json({ error: 'One or both users not found' });
            return;
        }

        // Update user1 with merged messages
        const updatedUser = await prisma.user.update({
            where: { id: userId1 },
            data: {
                points: {
                    increment: user2.points,
                },
            },
        });

        // Delete user2
        await prisma.user.delete({
            where: { id: userId2 },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fusing users' });
    }
});

app.post('/addPoints/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const pointsToAdd = req.body.pointsToAdd;

        // Find the user by ID to ensure it exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update the user with added points
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    increment: pointsToAdd, // Increment the user's points
                },
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding points' });
    }
});

app.post('/addMessageCount/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const messageAmount = req.body.messageAmount;

        // Find the user by ID to ensure it exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update the user with added points
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                messageAmount: {
                    increment: messageAmount, // Increment the user's messageAmount
                },
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding points' });
    }
});

app.post('/addLatestMessageDate', async (req, res) => {
    try {
        const date = req.body.date;
        // Add the latestMessageDate in the 'latestMessageDate' table
        await prisma.lastMessageDate.create({
            data: {
                date: date,
            },
        });
        res.json({ message: `Latest message date ${date} was added successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding latest message date' });
    }
});

app.post('/wipeDatabase', async (req, res) => {
    try {
        // Delete all records from the 'user' and 'message' tables
        await prisma.user.deleteMany({});
        await prisma.lastMessageDate.deleteMany({});

        // Add the latestMessageDate in the 'latestMessageDate' table
        await prisma.lastMessageDate.create({
            data: {
                date: new Date(2023, 9, 23, 0, 0),
            },
        });

        res.json({ message: 'Database wiped successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error wiping the database' });
    }
});

app.get('/latestMessageDate', async (req, res) => {
    try {
        // Get the latest message date from the 'latestMessageDate' table
        const date = await prisma.lastMessageDate.findFirst({
            orderBy: {
                date: 'desc',
            },
        });
        if (date) {
            const isoDate = date.date.toISOString();
            console.log(isoDate + " Date is sent");
            res.json(isoDate);
        } else {
            console.log("No date found");
            res.json({ message: 'No latest message date found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error getting latest message date' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));