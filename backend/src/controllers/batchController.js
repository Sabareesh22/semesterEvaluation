const db = require("../config/db");

exports.getAllBatches = async (req, res) => {
  try {
    const query = "SELECT * FROM master_batch";
    const [result] = await db.query(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch batches" });
  }
};

exports.createBatch = async (req, res) => {
  const { batch, status } = req.body;

  try {
    const checkQuery = "SELECT * FROM master_batch WHERE batch = ?";
    const [checkResult] = await db.query(checkQuery, [batch]);

    if (checkResult.length > 0) {
      return res.status(400).json({ error: "Batch already exists" });
    }

    const query = "INSERT INTO master_batch (batch, status) VALUES (?, ?)";
    const [result ]= await db.query(query, [batch, status]);
    res.status(201).json({ message: "Batch added successfully", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Error adding batch" });
  }
};

exports.updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batch, status } = req.body;

  try {
    const query = "UPDATE master_batch SET batch = ?, status = ? WHERE id = ?";
    await db.query(query, [batch, status, id]);
    res.status(200).json({ message: "Batch updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating batch" });
  }
};

exports.deleteBatch = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM master_batch WHERE id = ?";
    await db.query(query, [id]);
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting batch" });
  }
};
