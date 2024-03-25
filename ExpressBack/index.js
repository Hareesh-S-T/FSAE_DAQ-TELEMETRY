const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');
const mqtt = require('mqtt');

let client = null;
let isConnected = false;
let isLogging = false;

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.post('/connectMQTT', async (req, res) => {
    try {
        console.log(req.body);
        client = mqtt.connect(`ws://${req.body.connectionString}:${req.body.port}/mqtt`);
        client.subscribe(req.body.topic);
        isConnected = true;
        client.on('message', handleIncomingMessage);
        res.send("MQTT connected successfully.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error connecting to MQTT.");
    }
})

app.get('/startLogging', async (req, res) => {
    console.log("Start logging");
    isLogging = true;
    res.send("Logging started.");
});

app.get('/stopLogging', async (req, res) => {
    console.log("Stop logging");
    isLogging = false;
    res.send("Logging stopped.");
});

app.listen(process.env.PORT, () => {
    console.log(`Server Running on Port ${process.env.PORT}`);
});

async function handleIncomingMessage(topic, message) {
    const jsonData = JSON.parse(message.toString());
    const timestamp = new Date().toISOString();

    const sensorData = [];

    for (const key in jsonData) {
        if (key !== 'timestamp') { // Exclude timestamp from sensor data
            sensorData.push({
                name: key,
                val: jsonData[key]
            });
        }
    }

    try {

        if (isLogging) {
            const dataEntry = await prisma.dataEntry.create({
                data: {
                    createdAt: timestamp,
                    sensorData: jsonData
                }
            });

            console.log(dataEntry);
        }
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

