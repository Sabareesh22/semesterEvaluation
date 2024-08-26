
const db = require('../config/db'); 

exports.postChangeRequests = async (req, res) => {
    const { old_faculty,new_faculty, course, semcode,remark } = req.body;
    // Validate the input
    if (old_faculty == null||new_faculty==null || course == null || semcode == null ) {
        return res.status(400).json({ message: 'All fields are required: faculty, course, semcode' });
    }

    const insertQuery = `
        INSERT INTO faculty_change_requests (old_faculty,new_faculty, course, semcode,remark) 
        VALUES (?,?, ?, ?,?)
    `;
    
    try {
        const values = [old_faculty,new_faculty, course, semcode,remark];
        const [insertResult] = await db.query(insertQuery, values);
        
        res.status(201).json({ message: 'Faculty change request added successfully', requestId: insertResult.insertId });
    } catch (error) {
        console.error('Error inserting faculty change request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateChangeRequestStatus = async (req, res) => {
    const { old_faculty, new_faculty, course, semcode, status, remark } = req.body; // Get fields from the request body

    // Validate the input
    if (old_faculty == null || new_faculty == null || course == null || semcode == null || status == null) {
        return res.status(400).json({ message: 'Faculty, course, semcode, and status are required.' });
    }

    // Query to find the record with matching fields
    const checkQuery = `
        SELECT id FROM faculty_change_requests
        WHERE old_faculty = ? AND new_faculty = ? AND course = ? AND semcode = ?
    `;

    try {
        const [rows] = await db.query(checkQuery, [old_faculty, new_faculty, course, semcode]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching change request found.' });
        }

        const requestId = rows[0].id; // Get the ID of the matching record

        if (status === -2 || status === -1) {
            // Delete the faculty_change_request row
            const deleteRequestQuery = `
                DELETE FROM faculty_change_requests WHERE id = ?
            `;
            await db.query(deleteRequestQuery, [requestId]);

            // Update the status of the old_faculty in faculty_paper_allocation
            const updatedStatus = status === -2 ? -4 : -3;
            const updateAllocationStatusQuery = `
                UPDATE faculty_paper_allocation
                SET status = '?', remark = ?
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;
            await db.query(updateAllocationStatusQuery, [updatedStatus, remark || null, old_faculty, course, semcode]);

            return res.status(200).json({ message: `Status updated to ${updatedStatus}, faculty change request deleted.` });
        }

        // Update the status of the matching record
        const updateQuery = `
            UPDATE faculty_change_requests
            SET status = '?', remark = ?
            WHERE id = ?
        `;

        await db.query(updateQuery, [status, remark || null, requestId]); // Store remark as null if not provided

        // Check if the status is 2
        if (status === 2) {
            // Query to get the paper count of the old faculty
            const paperCountQuery = `
                SELECT paper_count FROM faculty_paper_allocation
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;

            const [paperCountRows] = await db.query(paperCountQuery, [old_faculty, course, semcode]);
            const paperCount = paperCountRows.length > 0 ? paperCountRows[0].paper_count : 0; // Default to 0 if not found


            // Check if the new faculty already has an allocation for this course and semcode
            const checkExistingAllocationQuery = `
                SELECT paper_count FROM faculty_paper_allocation
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;

            const [existingAllocationRows] = await db.query(checkExistingAllocationQuery, [new_faculty, course, semcode]);

            if (existingAllocationRows.length > 0) {
                // If the allocation exists, update the paper_count
                const newPaperCount = existingAllocationRows[0].paper_count + paperCount;
                const updateAllocationQuery = `
                    UPDATE faculty_paper_allocation
                    SET paper_count = ?, remark = ?
                    WHERE faculty = ? AND course = ? AND semcode = ?
                `;
                await db.query(updateAllocationQuery, [newPaperCount, remark || null, new_faculty, course, semcode]);
            } else {
                // If the allocation does not exist, insert a new row
                const insertQuery = `
                    INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode, status, remark)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                const insertValues = [new_faculty, course, paperCount, semcode, '2', remark || null];
                await db.query(insertQuery, insertValues);
            }

            // Remove the old faculty from faculty_paper_allocation
            const updateAllocationQuery = `
                UPDATE faculty_paper_allocation SET status='-5'
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;
            await db.query(updateAllocationQuery, [old_faculty, course, semcode]);


            // Delete the respective faculty_change_request row
            await db.query( `DELETE FROM faculty_change_requests WHERE id = ?`, [requestId]);

            return res.status(200).json({ message: 'Status updated to 2, old faculty removed, eligible faculty updated, and faculty change request deleted.' });
        }

    } catch (error) {
        console.error('Error updating faculty change request status:', error);
         return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({message:"Approved Chnage Request Successfully"})
}


exports.getFacultySuggestionsForChange =  async (req, res) => {
    const { courseId, semcode, facultyId } = req.query;
    // Validate the input
    if (courseId == null || semcode == null || facultyId == null) {
        return res.status(400).json({ message: 'courseId, semcode, and facultyId are required.' });
    }

    const query = `
        SELECT f.id, f.faculty_id, CONCAT(f.name,' - ',ms.semcode) name 
        FROM faculty_paper_allocation fpa
        INNER JOIN master_faculty f ON fpa.faculty = f.id
        INNER JOIN master_semcode ms ON ms.id = fpa.semcode
        WHERE fpa.course = ? 
          AND fpa.semcode != ? 
          AND fpa.faculty != ?;
    `;

    try {
        const [rows] = await db.query(query, [courseId, semcode, facultyId]);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No matching faculty found.' });
        }

        // Send the results
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty and semcode information:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFacultyChangeRequests = async (req, res) => {
    
    // Constructing the base query
    let query = `
        SELECT 
            fcr.id AS request_id,
            fcr.remark,
            old_faculty.id AS old_faculty_id,
            old_faculty.name AS old_faculty_name,
            old_faculty.faculty_id AS old_faculty_unique_id,
            new_faculty.id AS new_faculty_id,
            new_faculty.name AS new_faculty_name,
            new_faculty.faculty_id AS new_faculty_unique_id,
            mc.id AS course_id,
            mc.course_name,
            mc.course_code,
            ms.id AS semcode_id,
            ms.semcode
        FROM 
            faculty_change_requests fcr
        JOIN 
            master_faculty old_faculty ON fcr.old_faculty = old_faculty.id
        JOIN 
            master_faculty new_faculty ON fcr.new_faculty = new_faculty.id
        JOIN 
            master_courses mc ON fcr.course = mc.id
        JOIN 
            master_semcode ms ON fcr.semcode = ms.id
        WHERE fcr.status='1'
    `;
    
    const params = [];

    // Adding conditions based on provided query parameters (if needed)
    if (req.query.semcode) {
        query += ' WHERE ms.semcode = ?';
        params.push(req.query.semcode);
    }

    try {
        const [rows] = await db.query(query, params);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No records found' });
        }

        // Return the faculty change requests
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty change requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}