const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the 'adem' folder
app.use(express.static(path.join(__dirname, 'adem')));

// Serve index.html as default
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'adem', 'a.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
