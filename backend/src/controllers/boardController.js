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
  