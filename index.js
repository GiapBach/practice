const API_KEY = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ijg4YmYzNWNmLWM3ODEtNDQ3ZC1hYzc5LWMyODczMjNkNzg3ZCIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25JZCI6ImEyMThhZjYyLTk3YzktNGU4YS1hNzMwLThmOGJlZDMzYzg5YiIsImludGVncmF0aW9uSWQiOiJiZWFjMzVlYS0wNmFhLTRiNjgtOTJhMi0wNGI2MGEzMjM0M2UiLCJjbGllbnRJZCI6IjNkZTNmODMwLWNiYzctNDZlNi1iOTZlLTVmMDE2NzcyMTgzMCIsImp0aSI6ImNkMzA1YzI3LTNkMTctNDZiMC1hYWUzLTNjZGM2MzYzODQ1YyIsImlhdCI6MTcyNDY4OTg4NiwiaXNzIjoiaHR0cHM6Ly93d3cuY29nbml0b2Zvcm1zLmNvbS8iLCJhdWQiOiJhcGkifQ.21QzeScOt-rLvpoDw66ZUt_Df-7-ukA1LfSM8tKf6GU';
const FORM_ID = '1';

const axios = require('axios');

async function getAllEntries() {
  try {
    const response = await axios.get(`https://www.cognitoforms.com/api/v1/forms/${FORM_ID}/entries`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    // Response data contains the entries
    const entries = response.data;
    console.log(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
  }
}

// Call the function
getAllEntries();
