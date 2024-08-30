const axios = require('axios');
const mysql = require('mysql');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ijg4YmYzNWNmLWM3ODEtNDQ3ZC1hYzc5LWMyODczMjNkNzg3ZCIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25JZCI6ImEyMThhZjYyLTk3YzktNGU4YS1hNzMwLThmOGJlZDMzYzg5YiIsImludGVncmF0aW9uSWQiOiJmZmViODY5MC00MDdhLTQ3NGEtOTM3Yi00YmE4ZGUyZjU4MTAiLCJjbGllbnRJZCI6IjNkZTNmODMwLWNiYzctNDZlNi1iOTZlLTVmMDE2NzcyMTgzMCIsImp0aSI6ImZhNjAzODRmLTFiZjMtNDNjZi05YjVkLTZkNzY0YjYwMWRhMSIsImlhdCI6MTcyNDc4MjkxNCwiaXNzIjoiaHR0cHM6Ly93d3cuY29nbml0b2Zvcm1zLmNvbS8iLCJhdWQiOiJhcGkifQ.hAWMSDJfJChX9EDC-AMm91qm8MifHI5iZ0aAzHBCbmI'; 
const FORM_ID = '1';
const BASE_URL = 'https://www.cognitoforms.com/api';

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

async function fetchEntries(req, res) {
    let i = 1;
  
    while (true) {
        try {
            const url = `${BASE_URL}/forms/${FORM_ID}/entries/${i}`;
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${API_KEY}`,
              },
            });
      
            const entries = response.data;
      
            // Extract data from the JSON structure, excluding the Entry object
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
      
            // SQL query to check if the entry already exists
            const checkQuery = `
              SELECT COUNT(*) AS count 
              FROM example_table 
              WHERE id_entry = ?
            `;
      
            database.query(checkQuery, [idEntry], (error, results) => {
              if (error) throw error;
              
              const exists = results[0].count > 0;
              
              if (!exists) {
                // SQL query to insert the data, excluding the Entry object
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
      
                // Execute the insert query
                database.query(insertQuery, values, (insertError, insertResults) => {
                  if (insertError) throw insertError;
                  console.log('Data inserted:', insertResults.insertId);
                });
              } else {
                console.log('Entry already exists, skipping insertion.');
              }
            });
      
            i++;
            console.log('Entries:', entries);
      
          } catch (error) {
        if (error.response && error.response.status === 404) {
          // No more entries to fetch
          break;
        } else {
          return res.status(500).json({ error: error.message });
        }
      }
    }
  }
    
connectDatabase();
fetchEntries().finally(() => {
  disconnectDatabase();
});


