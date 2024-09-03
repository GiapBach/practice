const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
const FORM_ID = process.env.FORM_ID;
const BASE_URL = process.env.BASE_URL;

// Configure email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to fetch entry data from Cognito Forms
async function fetchEntryData(entryId) {
  const url = `${BASE_URL}/forms/${FORM_ID}/entries/${entryId}`;
  
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching entry data:', error);
    throw error;
  }
}

// Function to generate a pre-filled form URL
function generatePrefilledFormUrl(entryId, userData) {
  return `${BASE_URL}/forms/${FORM_ID}/entries/new?prefill=${encodeURIComponent(JSON.stringify(userData))}`;
}

// Function to send an email with the pre-filled form URL
async function sendPrefilledFormEmail(userEmail, prefilledUrl) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Pre-filled Form',
    text: `You can review and update your submission using the following link: ${prefilledUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// API endpoint to handle form submission and send pre-filled form
app.post('/submit-form', async (req, res) => {
  const { entryId, userEmail } = req.body;

  try {
    const entryData = await fetchEntryData(entryId);
    const prefilledUrl = generatePrefilledFormUrl(entryId, entryData);
    await sendPrefilledFormEmail(userEmail, prefilledUrl);
    res.json({ message: 'Pre-filled form URL sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to handle form updates
app.post('/update-form', async (req, res) => {
  const { entryId, updatedData } = req.body;

  const url = `${BASE_URL}/forms/${FORM_ID}/entries/${entryId}`;

  try {
    await axios.put(url, updatedData, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    res.json({ message: 'Entry updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
