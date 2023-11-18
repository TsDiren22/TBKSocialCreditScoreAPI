const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const prisma = new PrismaClient(); // Create an instance of the Prisma client

const app = express();


app.use(cors({
    origin: 'https://tbksocialcreditsystem.web.app',
    credentials: true,
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.json())
app.use(cookieParser())



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

        await prisma.user.create({
            data: {
                name: 'Diren',
                points: 0,
                messageAmount: 0,
                username: null,
                password: null,
                phone: null,
            },
        });

        await prisma.user.create({
            data: {
                name: 'Jon',
                points: 0,
                messageAmount: 0,
                username: null,
                password: null,
                phone: null,
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
            res.json(isoDate);
        } else {
            res.json({ message: 'No latest message date found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error getting latest message date' });
    }
});

app.post('/register', async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const id = req.body.id;

    try {
        let user = await prisma.user.findFirst({
            where: { id: id },
        })

        console.log("User is found");
        console.log(user);

        if (!user) {
            return res.status(404).json({ error: "User doesn't exist" });
        }

        console.log("User exists");
        console.log(user.password);

        if (user.password != null) {
            return res.status(400).json({ error: "User already registered" });
        }

        console.log("User exists without account");

        const usernameCheck = prisma.user.findFirst({
            where: { username: req.body.username },
        });

        console.log("Username is not found?");
        console.log(usernameCheck);

        const phoneCheck = prisma.user.findFirst({
            where: { phone: req.body.phone },
        });

        console.log("Phone is not found?");
        console.log(phoneCheck);

        if (usernameCheck.name != null) {
            return res.status(400).json({ error: "Username already taken" });
        }

        console.log("Username is not taken");

        if (phoneCheck.phone != null) {
            return res.status(400).json({ error: "Phone number already taken" });
        }

        console.log("Phone number is not taken");
        console.log(hashedPassword)
        console.log(typeof hashedPassword)

        user.password = hashedPassword;
        user.phone = req.body.phone;
        user.username = req.body.username;

        user.id = undefined;

        user = await prisma.user.update({
            where: { id: id },
            data: user,
        });

        console.log("User is updated");

        const token = jwt.sign({ _id: user.id }, "secret");

        console.log("Token is created");
        console.log(token);

        res.cookie('jwt', token, {
            maxAge: 24 * 60 * 60 * 1000,
        });

        console.log("Cookie is created");

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error during registration' });
    }
});

app.post('/login', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.body.username }
    })

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user.id }, "secret")

    res.cookie('jwt', token, {
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.send(user)
})

app.get('/validate', async (req, res) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'secret')

        if (!claims) {
            return res.status(401).send({
                message: 'unauthenticated'
            })
        }

        const user = await prisma.user.findFirst({
            where: { id: claims._id }
        })

        res.send(user)
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        })
    }
})

app.post('/logout', (req, res) => {
    const jwtCookie = req.cookies['jwt'];

    // Remove the JWT cookie
    res.cookie('jwt', '', { maxAge: 0 });

    res.send({
        message: 'success'
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));