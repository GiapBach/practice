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

async function fetchEntries() {
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

      // Insert JSON data as a string
      const jsonEntries = JSON.stringify(entries);
      database.query('INSERT INTO example_table (data) VALUES (?)', [jsonEntries], (error, results) => {
        if (error) throw error;
        console.log('Data inserted:', results.insertId);
      });

      console.log('Entries:', entries);
    } catch (error) {
      console.error('Error fetching entries:', error.message);
      break;
    }
    i++;
  }
}

connectDatabase();
fetchEntries().finally(() => {
  disconnectDatabase();
});
