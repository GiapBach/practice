const express = require('express');
const app = express();
const entriesRoutes = require('./routes/entriesRoutes');

app.use(express.json());

// Routes
app.use('/api', entriesRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
