const axios = require('axios');
const pool = require('../config/db');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ijg4YmYzNWNmLWM3ODEtNDQ3ZC1hYzc5LWMyODczMjNkNzg3ZCIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25JZCI6ImEyMThhZjYyLTk3YzktNGU4YS1hNzMwLThmOGJlZDMzYzg5YiIsImludGVncmF0aW9uSWQiOiJmZmViODY5MC00MDdhLTQ3NGEtOTM3Yi00YmE4ZGUyZjU4MTAiLCJjbGllbnRJZCI6IjNkZTNmODMwLWNiYzctNDZlNi1iOTZlLTVmMDE2NzcyMTgzMCIsImp0aSI6ImZhNjAzODRmLTFiZjMtNDNjZi05YjVkLTZkNzY0YjYwMWRhMSIsImlhdCI6MTcyNDc4MjkxNCwiaXNzIjoiaHR0cHM6Ly93d3cuY29nbml0b2Zvcm1zLmNvbS8iLCJhdWQiOiJhcGkifQ.hAWMSDJfJChX9EDC-AMm91qm8MifHI5iZ0aAzHBCbmI'; 
const FORM_ID = '1';
const BASE_URL = 'https://www.cognitoforms.com/api';

async function fetchEntries(req, res) {
  let i = 1;
  while (true){
    try {
        const url = `${BASE_URL}/forms/${FORM_ID}/entries/${i}`;
        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
    
        const entries = response.data;
        const jsonEntries = JSON.stringify(entries);
    
        pool.query('INSERT INTO example_table (data) VALUES (?)', [jsonEntries], (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          res.status(200).json({ message: 'Data inserted', id: results.insertId });
        });

        i++;
    
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }
}

module.exports = { fetchEntries };
