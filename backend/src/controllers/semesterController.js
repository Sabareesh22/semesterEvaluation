const db = require('../config/db');

// Create a new semester (avoid duplicates)
exports.createSemester = async (req, res) => {
  const { semester, status } = req.body;

  try {
    // Check if the semester already exists
    const [existingSemester] = await db.query('SELECT * FROM master_semester WHERE semester = ?', [semester]);

    if (existingSemester.length > 0) {
      return res.status(400).json({ error: 'Semester already exists' });
    }

    // If semester does not exist, insert it
    const query = 'INSERT INTO master_semester (semester, status) VALUES (?, ?)';
    const result = await db.query(query, [semester, status]);

    res.status(201).json({ message: 'Semester added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error adding semester' });
  }
};

// Dynamic GET: Get all semesters with dynamic filters
exports.getSemesters = async (req, res) => {
  try {
    let query = 'SELECT * FROM master_semester WHERE 1=1'; // '1=1' helps concatenate conditions
    const params = [];

    // Dynamically build the query based on query parameters
    Object.keys(req.query).forEach((key) => {
      query += ` AND ${key} = ?`;
      params.push(req.query[key]);
    });

    const [semesters] = await db.query(query, params);
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching semesters' });
  }
};

// Dynamic UPDATE: Update a semester based on fields passed
exports.updateSemester = async (req, res) => {
  const { id } = req.params;

  try {
    let query = 'UPDATE master_semester SET ';
    const params = [];

    // Build the query dynamically based on the fields in the request body
    Object.keys(req.body).forEach((key, index) => {
      if (index > 0) query += ', '; // Add a comma after the first field
      query += `${key} = ?`;
      params.push(req.body[key]);
    });

    query += ' WHERE id = ?';
    params.push(id);

    const result = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Semester not found or no changes made' });
    }

    res.status(200).json({ message: 'Semester updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating semester' });
  }
};

// Get a semester by ID
exports.getSemesterById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM master_semester WHERE id = ?';
    const [semester] = await db.query(query, [id]);

    if (semester.length === 0) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    res.status(200).json(semester[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching semester' });
  }
};

// Delete a semester by ID
exports.deleteSemester = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM master_semester WHERE id = ?';
    const result = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    res.status(200).json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting semester' });
  }
};
