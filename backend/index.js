const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const bcrypt = require('bcryptjs');
const imageDownloader = require('image-downloader');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cookieParser());

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret"; // Use environment variable

app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get('/test', (req, res) => {
    res.send('test ok');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (err) {
        console.error(err);
        res.status(422).json({ error: 'Registration failed', details: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            jwt.sign(
                { email: user.email, id: user._id, name: user.name },
                jwtSecret,
                {},
                (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(user);
                }
            );
        } else {
            res.status(422).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
});

app.get('/profile', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
        try {
            const user = jwt.verify(token, jwtSecret);
            const { name, email, _id } = await User.findById(user.id);
            res.json({ name, email, _id });
        } catch (err) {
            console.error(err);
            res.status(401).json({ error: 'Unauthorized' });
        }
    } else {
        res.json(null);
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) }).json(true);
});

app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    try {
        await imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName
        });
        res.json(newName);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Image download failed', details: err.message });
    }
});

const photosMiddleware = multer({ dest: 'uploads/' });
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    try {
        const uploadedFiles = [];
        for (const file of req.files) {
            const { path, originalname } = file;
            const ext = originalname.split('.').pop();
            const newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
            uploadedFiles.push(newPath.replace('uploads/', ''));
        }
        res.json(uploadedFiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'File upload failed', details: err.message });
    }
});

app.post('/places', async (req, res) => {
    const { token } = req.cookies;
    const {
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
    } = req.body;

    try {
        const user = jwt.verify(token, jwtSecret);
        const placeDoc = await Place.create({
            owner: user.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
        });
        res.json(placeDoc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create place', details: err.message });
    }
});

app.get('/places', async (req, res) => {
    const { token } = req.cookies;
    try {
        const user = jwt.verify(token, jwtSecret);
        const places = await Place.find({ owner: user.id });
        res.json(places);
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findById(id);
        res.json(place);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch place', details: err.message });
    }
});

app.listen(4000, () => console.log('Server is listening on port 4000'));
