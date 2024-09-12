const pool = require('../config/db'); // Import your database connection pool

// Get all mappings
exports.getAllMappings = async (req, res) => {
    try {
      const [results] = await pool.query(`
        SELECT DISTINCT
mf.id AS facultyId,
fcm.id AS mappingId,
mc.id AS courseId,
    mf.faculty_id AS facultyCode,
    mf.name AS facultyName,
    mc.course_code AS courseCode,
    md.department AS department
FROM 
    faculty_course_mapping fcm
JOIN 
    master_faculty mf ON fcm.faculty = mf.id
JOIN 
    master_courses mc ON fcm.course = mc.id
JOIN 
    master_department md ON mf.department = md.id
WHERE 
    fcm.status = "1" 
    AND mf.status = "1"
    AND mc.status = "1"
      `);
      
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  



// Get a single mapping by ID
exports.getMappingById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM faculty_course_mapping WHERE id = ? AND status = "1"', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new mapping
exports.createMapping = async (req, res) => {
  const { faculty, course, status } = req.body;
  try {
    const [results] = await pool.query('INSERT INTO faculty_course_mapping (faculty, course, status) VALUES (?, ?, ?)', [faculty, course, status]);
    res.status(201).json({ message: 'Mapping created successfully', id: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get courses not mapped to a specific faculty
exports.getCoursesNotMappedToFaculty = async (req, res) => {
  const { facultyId } = req.params;

  try {
    const [results] = await pool.query(`
      SELECT
        mc.id AS courseId,
        mc.course_code AS courseCode
      FROM
        master_courses mc
      LEFT JOIN
        faculty_course_mapping fcm
      ON
        mc.id = fcm.course
        AND fcm.faculty = ?
        AND fcm.status = "1"
      WHERE
        fcm.course IS NULL
        AND mc.status = "1"
    `, [facultyId]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update a mapping dynamically
exports.updateMapping = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Build dynamic update query
  let query = 'UPDATE faculty_course_mapping SET ';
  const fields = [];
  const values = [];

  Object.keys(updates).forEach((key) => {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  });

  query += fields.join(', ') + ' WHERE id = ?';
  values.push(id);

  try {
    await pool.query(query, values);
    res.status(200).json({ message: 'Mapping updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a mapping
exports.deleteMapping = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM faculty_course_mapping WHERE id = ?', [id]);
    res.status(200).json({ message: 'Mapping deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
