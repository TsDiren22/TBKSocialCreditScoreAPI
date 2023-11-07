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

// API to add all new messages to given user
app.post('/addMessages', async (req, res) => {
    try {
        const userId = req.body.id;
        const messages = req.body.messages;

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                messages: {
                    create: messages.map((message) => {
                        return {
                            text: message.text,
                        };
                    }),
                },
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding messages' });
    }
});

// API to retrieve all messages for given user
// Get all messages
app.get('/getMessages/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const messages = await prisma.message.findMany({
            where: { userId },
        });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving messages' });
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
            include: { messages: true }, // Include messages for the first user
        });

        const user2 = await prisma.user.findUnique({
            where: { id: userId2 },
            include: { messages: true }, // Include messages for the second user
        });

        if (!user1 || !user2) {
            res.status(404).json({ error: 'One or both users not found' });
            return;
        }

        // Merge messages of user2 into user1
        user2.messages.forEach((message) => {
            user1.messages.push(message);
        });

        // Update user1 with merged messages
        const updatedUser = await prisma.user.update({
            where: { id: userId1 },
            data: {
                messages: {
                    set: user1.messages, // Set the merged messages for user1
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

app.listen(3000, () => console.log('Server running on port 3000'));