const db = require('../config/db');

// Create a new year
exports.createYear = async (req, res) => {
    const { year, status } = req.body;
  
    try {
      // Check if the year already exists
      const [existingYear] = await db.query('SELECT * FROM master_year WHERE year = ?', [year]);
  
      if (existingYear.length > 0) {
        return res.status(400).json({ error: 'Year already exists' });
      }
  
      // If year does not exist, insert it
      const query = 'INSERT INTO master_year (year, status) VALUES (?, ?)';
      const result = await db.query(query, [year, status]);
  
      res.status(201).json({ message: 'Year added successfully', id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: 'Error adding year' });
    }
  };
  

// Dynamic GET: Get all years with dynamic filters
exports.getYears = async (req, res) => {
  try {
    // Dynamically build the query based on the passed query parameters
    let query = 'SELECT * FROM master_year WHERE 1=1'; // '1=1' helps to concatenate conditions
    const params = [];

    // Loop through query params and dynamically add them to the query
    Object.keys(req.query).forEach((key) => {
      query += ` AND ${key} = ?`;
      params.push(req.query[key]);
    });

    const [years] = await db.query(query, params);
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching years' });
  }
};

// Dynamic UPDATE: Update a year dynamically based on the fields passed
exports.updateYear = async (req, res) => {
  const { id } = req.params;

  try {
    // Dynamically construct the update query
    let query = 'UPDATE master_year SET ';
    const params = [];

    // Loop through request body to create dynamic query for updates
    Object.keys(req.body).forEach((key, index) => {
      if (index > 0) query += ', '; // Add a comma after the first field
      query += `${key} = ?`;
      params.push(req.body[key]);
    });

    query += ' WHERE id = ?';
    params.push(id);

    const result = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Year not found or no changes made' });
    }

    res.status(200).json({ message: 'Year updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating year' });
  }
};

// Get a year by ID
exports.getYearById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM master_year WHERE id = ?';
    const [year] = await db.query(query, [id]);

    if (year.length === 0) {
      return res.status(404).json({ error: 'Year not found' });
    }

    res.status(200).json(year[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching year' });
  }
};

// Delete a year by ID
exports.deleteYear = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM master_year WHERE id = ?';
    const result = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Year not found' });
    }

    res.status(200).json({ message: 'Year deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting year' });
  }
};
