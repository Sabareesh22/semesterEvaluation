const express = require('express');
const app = express();
const apiRoutes = require('./routes/api'); // Adjust the path if necessary
const cors = require('cors');
const verifyToken = require('./middlewares/authMiddleware')
app.use(cors());
const semcodeRoutes =  require('./routes/semcodes')
const AuthRoutes = require('./routes/Auth')
// Middleware
app.use(express.json());

// API Routes
app.use('/auth', AuthRoutes); // Unprotected routes for authentication
app.use('/api', verifyToken, semcodeRoutes); // Protected routes for semcode
app.use('/', verifyToken, apiRoutes); // Protected routes for other API functionality

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
