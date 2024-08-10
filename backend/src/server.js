const express = require('express');
const app = express();
const apiRoutes = require('./routes/api'); // Adjust the path if necessary
const cors = require('cors');
app.use(cors());
const semcodeRoutes =  require('./routes/semcodes')
// Middleware
app.use(express.json());

// API Routes
app.use('/', apiRoutes);
app.use('/api', semcodeRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
