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

// const express = require('express');
// const axios = require('axios'); // For making HTTP requests
// const mysql = require('mysql');
// require('dotenv').config();

// const app = express();
// app.use(express.json()); // Middleware to parse JSON bodies

// // Replace with your Webhook.site URL or your actual webhook URL
// const WEBHOOK_SITE_URL = 'https://webhook.site/c2cc893d-bb58-4e5d-9920-b56a7a4adbfa';

// // Database connection setup
// const database = mysql.createConnection({
//   host: '10.11.90.15',
//   port: '3306',
//   user: 'AppUser',
//   password: 'Special888%',
//   database: 'Study',
// });

// function connectDatabase() {
//   database.connect((err) => {
//     if (err) {
//       console.error('Database connection failed:', err);
//       process.exit(1);
//     }
//     console.log('Connected to database.');
//   });
// }

// // Function to update or insert an entry in the database and send data to Webhook.site
// function upsertEntry(entry, callback) {
//   const {
//     Form: { Id: formId, InternalName: formInternalName, Name: formName },
//     FirstName: firstName,
//     SecondName: secondName,
//     Address: {
//       City: city,
//       CityStatePostalCode: cityStatePostalCode,
//       Country: country,
//       CountryCode: countryCode,
//       FullAddress: fullAddress,
//       FullInternationalAddress: fullInternationalAddress,
//       Latitude: latitude,
//       Longitude: longitude,
//       PostalCode: postalCode,
//       State: state,
//       StreetAddress: streetAddress,
//       Type: addressType
//     },
//     Date: date,
//     Id: idEntry
//   } = entry;

//   const checkQuery = `
//     SELECT COUNT(*) AS count 
//     FROM example_table 
//     WHERE id_entry = ?
//   `;

//   database.query(checkQuery, [idEntry], (error, results) => {
//     if (error) return callback(error);

//     const exists = results[0].count > 0;

//     if (exists) {
//       // Update the existing entry
//       const updateQuery = `
//         UPDATE example_table 
//         SET form_id = ?, form_internal_name = ?, form_name = ?, first_name = ?, 
//             second_name = ?, city = ?, city_state_postal_code = ?, country = ?, 
//             country_code = ?, full_address = ?, full_international_address = ?, 
//             latitude = ?, longitude = ?, postal_code = ?, state = ?, 
//             street_address = ?, address_type = ?, date = ?
//         WHERE id_entry = ?
//       `;

//       const values = [
//         formId, formInternalName, formName, firstName, secondName, city,
//         cityStatePostalCode, country, countryCode, fullAddress,
//         fullInternationalAddress, latitude, longitude, postalCode,
//         state, streetAddress, addressType, date, idEntry
//       ];

//       database.query(updateQuery, values, (updateError, updateResults) => {
//         if (updateError) return callback(updateError);
//         console.log(`Data updated for entry ID ${idEntry}`);
        
//         // Send updated data to Webhook.site
//         axios.post(WEBHOOK_SITE_URL, entry)
//           .then(response => {
//             console.log('Updated data sent to Webhook.site:', response.status);
//           })
//           .catch(error => {
//             console.error('Error sending updated data to Webhook.site:', error.message);
//           });

//         callback(null, updateResults.affectedRows);
//       });

//     } else {
//       console.log('Entry does not exist, cannot update.');
//       callback(null, null);
//     }
//   });
// }

// // Endpoint to handle incoming POST requests for updates
// app.post('/webhook/update', (req, res) => {
//   const entry = req.body; // Cognito sends form data in JSON format

//   if (!entry || !entry.Id) {
//     return res.status(400).json({ error: 'Invalid entry data' });
//   }

//   upsertEntry(entry, (err, affectedRows) => {
//     if (err) {
//       console.error('Error upserting entry:', err);
//       return res.status(500).json({ error: 'Error upserting entry' });
//     }

//     if (affectedRows) {
//       console.log(`User updated entry with ID: ${entry.Id}`);
//       res.status(200).json({ message: 'Entry updated', entryId: entry.Id });
//     } else {
//       res.status(404).json({ message: 'Entry does not exist, cannot update.' });
//     }
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   connectDatabase(); // Connect to the database when the server starts
//   console.log(`Server is running on port ${PORT}`);
// });
