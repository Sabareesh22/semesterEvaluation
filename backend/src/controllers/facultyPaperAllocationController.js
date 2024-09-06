// controllers/facultyPaperAllocationController.js
const db = require('../config/db'); // Assuming db.js is your MySQL connection setup

// Get all faculty paper allocations
exports.getAllAllocations = (req, res) => {
  const query = 'SELECT * FROM faculty_paper_allocation';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a single faculty paper allocation by ID
exports.getAllocationById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM faculty_paper_allocation WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json(results[0]);
  });
};

// Create a new faculty paper allocation
exports.createAllocation = (req, res) => {
  const { faculty, course, paper_count, semcode, handlingFaculty, status, remark } = req.body;
  const query = 'INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode, handlingFaculty, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [faculty, course, paper_count, semcode, handlingFaculty, status, remark], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, ...req.body });
  });
};

// Update a faculty paper allocation by ID
exports.updateAllocation = (req, res) => {
  const { id } = req.params;
  const { faculty, course, paper_count, semcode, handlingFaculty, status, remark } = req.body;
  const query = 'UPDATE faculty_paper_allocation SET faculty = ?, course = ?, paper_count = ?, semcode = ?, handlingFaculty = ?, status = ?, remark = ? WHERE id = ?';
  db.query(query, [faculty, course, paper_count, semcode, handlingFaculty, status, remark, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ message: 'Allocation updated successfully' });
  });
};

// Delete a faculty paper allocation by ID
exports.deleteAllocation = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM faculty_paper_allocation WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json({ message: 'Allocation deleted successfully' });
  });
};
exports.getAllocationsWithFilters = async(req, res) => {
    let query = `
     SELECT mf.faculty_id,mf.id,mc.id course_id,mc.course_code,fpa.status
      FROM faculty_paper_allocation fpa 
      INNER JOIN master_courses mc ON fpa.course = mc.id 
INNER JOIN board_course_mapping bcm ON bcm.course = mc.id
      INNER JOIN master_faculty mf On mf.id = fpa.faculty
      WHERE 1=1`;
    const queryParams = [];
  
    // Dynamically add filters based on query parameters
    if (req.query.faculty) {
      query += ' AND fpa.faculty = ?';
      queryParams.push(req.query.faculty);
    }
  
    if (req.query.course) {
      query += ' AND fpa.course = ?';
      queryParams.push(req.query.course);
    }
  
    if (req.query.paper_count) {
      query += ' AND fpa.paper_count = ?';
      queryParams.push(req.query.paper_count);
    }
  
    if (req.query.semcode) {
      query += ' AND fpa.semcode = ?';
      queryParams.push(req.query.semcode);
    }
  
    if (req.query.handlingFaculty) {
      query += ' AND fpa.handlingFaculty = ?';
      queryParams.push(req.query.handlingFaculty);
    }
  
    if (req.query.status) {
      query += ' AND fpa.status = ?';
      queryParams.push(req.query.status);
    }
  
    if (req.query.remark) {
      query += ' AND fpa.remark LIKE ?';
      queryParams.push(`%${req.query.remark}%`);
    }
  
    // Filter by department if provided
    if (req.query.department) {
      query += ' AND bcm.department = ?';
      queryParams.push(req.query.department);
    }

    const [result] =await db.query(query, queryParams);
    if(result) {
        res.json(result);
    }
  };