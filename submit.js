const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
require('dotenv').config();

const API_KEY = process.env.API_KEY; 
const FORM_ID = process.env.FORM_ID;
const BASE_URL = process.env.BASE_URL;

const app = express();

// Database connection setup
const database = mysql.createConnection({
  host: '10.11.90.15',
  port: '3306',
  user: 'AppUser',
  password: 'Special888%',
  database: 'Study',
});

function connectDatabase() {
  database.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
    }
    console.log('Connected to database.');
  });
}

function disconnectDatabase() {
  database.end((err) => {
    if (err) {
      console.error('Error disconnecting from database:', err);
    } else {
      console.log('Disconnected from database.');
    }
  });
}

// Function to fetch and insert entries into the database
async function fetchEntries(req, res) {
  let i = 1;
  let insertedCount = 0;
  let skippedCount = 0;

  while (true) {
    try {
      const url = `${BASE_URL}/forms/${FORM_ID}/entries/${i}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      const entries = response.data;

      const {
        Form: { Id: formId, InternalName: formInternalName, Name: formName },
        FirstName: firstName,
        SecondName: secondName,
        Address: {
          City: city,
          CityStatePostalCode: cityStatePostalCode,
          Country: country,
          CountryCode: countryCode,
          FullAddress: fullAddress,
          FullInternationalAddress: fullInternationalAddress,
          Latitude: latitude,
          Longitude: longitude,
          PostalCode: postalCode,
          State: state,
          StreetAddress: streetAddress,
          Type: addressType
        },
        Date: date,
        Id: idEntry
      } = entries;

      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM example_table 
        WHERE id_entry = ?
      `;

      database.query(checkQuery, [idEntry], (error, results) => {
        if (error) throw error;
        
        const exists = results[0].count > 0;
        
        if (!exists) {
          const insertQuery = `
            INSERT INTO example_table (
              form_id, form_internal_name, form_name, first_name, second_name, city, 
              city_state_postal_code, country, country_code, full_address, 
              full_international_address, latitude, longitude, postal_code, 
              state, street_address, address_type, date, id_entry
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            formId, formInternalName, formName, firstName, secondName, city,
            cityStatePostalCode, country, countryCode, fullAddress,
            fullInternationalAddress, latitude, longitude, postalCode,
            state, streetAddress, addressType, date, idEntry
          ];

          database.query(insertQuery, values, (insertError, insertResults) => {
            if (insertError) throw insertError;
            insertedCount++;
            console.log('Data inserted:', insertResults.insertId);
          });
        } else {
          skippedCount++;
          console.log('Entry already exists, skipping insertion.');
        }
      });

      i++;

    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No more entries to fetch
        break;
      } else {
        console.error('Error fetching entries:', error);
        return res.status(500).json({ error: error.message });
      }
    }
  }

  res.json({ message: 'Entries fetched and processed.', inserted: insertedCount, skipped: skippedCount });
}

app.get('/fetch-entries', async (req, res) => {
  connectDatabase();
  await fetchEntries(req, res);
  disconnectDatabase();
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
