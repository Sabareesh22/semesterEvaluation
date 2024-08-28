const db = require('../config/db'); 


exports.postBoardChiefExaminer = async (req, res) => {
    const { board, faculty, semcode, status } = req.body;
  
    if (!board || !faculty || !semcode || status === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const query = `
        INSERT INTO board_chief_examiner_mapping (board, faculty, semcode, status)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [board, faculty, semcode, status]);
  
      res.status(201).json({ message: 'Data inserted successfully', insertId: result.insertId });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'An error occurred while inserting data' });
    }
  }


  exports.updateBoardChiefExaminer = async (req, res) => {
    const { id, faculty } = req.body;
  
    if (!faculty || !id) {
      return res.status(400).json({ error: 'Faculty ID and record ID are required' });
    }
  
    try {
      const query = `
        UPDATE board_chief_examiner_mapping
        SET faculty = ?
        WHERE id = ?
      `;
      await db.query(query, [faculty, id]);
  
      return res.status(200).json({ message: 'Faculty ID updated successfully' });
  
    } catch (error) {
      console.error('Error updating faculty ID:', error);
      return res.status(500).json({ error: 'An error occurred while updating faculty ID' });
    }
  };
  
  exports.insertBoardChairman = async (req, res) => {
    const { board, chairman, semcode, status } = req.body;
  
    if (!board || !chairman || !semcode || !status) {
      return res.status(400).json({ error: 'All fields (board, chairman, semcode, status) are required' });
    }
  
    try {
      const query = `
        INSERT INTO board_chairman_mapping (board, chairman, semcode, status)
        VALUES (?, ?, ?, ?)
      `;
      await db.query(query, [board, chairman, semcode, status]);
  
      return res.status(201).json({ message: 'Board Chairman mapping inserted successfully' });
  
    } catch (error) {
      console.error('Error inserting board chairman mapping:', error);
      return res.status(500).json({ error: 'An error occurred while inserting board chairman mapping' });
    }
  };
  

  exports.updateBoardChairman = async (req, res) => {
    const { id, board, chairman, semcode, status } = req.body;
  
    // Check if `id` is provided
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
  
    // Build the query dynamically based on provided fields
    let fieldsToUpdate = [];
    let values = [];
  
    if (board !== undefined) {
      fieldsToUpdate.push('board = ?');
      values.push(board);
    }
    if (chairman !== undefined) {
      fieldsToUpdate.push('chairman = ?');
      values.push(chairman);
    }
    if (semcode !== undefined) {
      fieldsToUpdate.push('semcode = ?');
      values.push(semcode);
    }
    if (status !== undefined) {
      fieldsToUpdate.push('status = ?');
      values.push(status);
    }
  
    // Ensure at least one field is provided to update
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'At least one field (board, chairman, semcode, status) must be provided to update' });
    }
  
    try {
      // Construct the final query
      const query = `
        UPDATE board_chairman_mapping
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = ?
      `;
      values.push(id); // Add `id` to the values array for the WHERE clause
  
      const result = await db.query(query, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No record found with the provided ID' });
      }
  
      return res.status(200).json({ message: 'Board Chairman mapping updated successfully' });
  
    } catch (error) {
      console.error('Error updating board chairman mapping:', error);
      return res.status(500).json({ error: 'An error occurred while updating board chairman mapping' });
    }
  };

  exports.postBoardChiefExaminerAddition  = async (req, res) => {
    const { chief_examiner, board,semcode, reason } = req.body;
  
    // Validate required fields
    if (!chief_examiner || !board ||!semcode || !reason) {
      return res.status(400).json({ error: 'Chief Examiner, Board Chief Examiner Mapping, and Reason are required' });
    }
  
    try {
      // Construct the query
      const query = `
        INSERT INTO board_chief_examiner_mapping (faculty, board,semcode,reason,status)
        VALUES (?, ?, ?, ?,'0')
      `;
      
      // Execute the query
      await db.query(query, [chief_examiner, board,semcode, reason]);
  
      // Return success response
      return res.status(201).json({ message: 'Board Chief Examiner Add Request created successfully' });
  
    } catch (error) {
      console.error('Error creating board chief examiner add request:', error);
      return res.status(500).json({ error: 'An error occurred while creating board chief examiner add request' });
    }
  };


  exports.getBoardChiefExaminerAddRequests = async (req, res) => {
    const { board, semcode } = req.query;
  
    // Validate that both board and semcode are provided
    if (!board || !semcode) {
      return res.status(400).json({ error: 'Board and Semcode are required' });
    }
  
    try {
      // Construct the SQL query
      const query = `
        SELECT
          id,
          chief_examiner,
          board,
          semcode,
          reason,
          status
        FROM
          board_chief_examiner_add_requests
        WHERE
          board = ? AND semcode = ?
      `;
  
      // Execute the query
      const [results] = await db.query(query, [board, semcode]);
  
      // Check if results are found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No requests found for the provided board and semcode' });
      }
  
      // Return the results
      return res.status(200).json(results);
  
    } catch (error) {
      console.error('Error fetching board chief examiner add requests:', error);
      return res.status(500).json({ error: 'An error occurred while fetching board chief examiner add requests' });
    }
  };
  
  exports.deleteBoardChiefExaminerMapping = async (req, res) => {
    const { id } = req.query;
  
    // Validate that the id is provided
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
  
    try {
      // Construct the SQL query
      const query = `
        DELETE FROM board_chief_examiner_mapping
        WHERE id = ?
      `;
  
      // Execute the query
      const [result] = await db.query(query, [id]);
  
      // Check if any row was affected (i.e., deleted)
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No record found with the provided ID' });
      }
  
      // Return success response
      return res.status(200).json({ message: 'Record deleted successfully' });
  
    } catch (error) {
      console.error('Error deleting record from board_chief_examiner_mapping:', error);
      return res.status(500).json({ error: 'An error occurred while deleting the record' });
    }
  };
  