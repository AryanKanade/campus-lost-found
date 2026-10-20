const pool = require("../config/db");

const {
    validateReport,
    allowedCategories,
    allowedReportTypes
} = require("../validators/reportValidator");

async function createReport(req, res) {
  const { data, errors } = validateReport(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Please correct the following fields.",
      errors,
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO item_reports (
                report_type,
                item_name,
                category,
                item_date,
                location,
                description,
                contact_name,
                contact_email,
                contact_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.report_type,
        data.item_name,
        data.category,
        data.item_date,
        data.location,
        data.description || null,
        data.contact_name,
        data.contact_email || null,
        data.contact_phone || null,
      ],
    );

    return res.status(201).json({
      message: "Report submitted successfully.",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("Report submission failed:", error.message);

    return res.status(500).json({
      message: "Unable to save the report. Please try again.",
    });
  }
}

async function getReports(req, res) {
  const fields = ["search", "report_type", "category", "location"];

  for (const field of fields) {
    if (
      req.query[field] !== undefined &&
      typeof req.query[field] !== "string"
    ) {
      return res.status(400).json({
        message: `Invalid ${field} parameter.`,
      });
    }
  }

  const search = (req.query.search || "").trim();
  const reportType = (req.query.report_type || "").trim().toUpperCase();
  const category = (req.query.category || "").trim();
  const location = (req.query.location || "").trim();

  if (search.length > 100) {
    return res.status(400).json({
      message: "Search must not exceed 100 characters.",
    });
  }

  if (location.length > 150) {
    return res.status(400).json({
      message: "Location filter must not exceed 150 characters.",
    });
  }

  if (reportType && !allowedReportTypes.has(reportType)) {
    return res.status(400).json({
      message: "Report type must be LOST or FOUND.",
    });
  }

  if (category && !allowedCategories.has(category)) {
    return res.status(400).json({
      message: "Please select a valid category.",
    });
  }

  const conditions = [];
  const params = [];

  if (reportType) {
    conditions.push("report_type = ?");
    params.push(reportType);
  }

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }

  if (location) {
    conditions.push("location LIKE ?");
    params.push(`%${location}%`);
  }

  if (search) {
    conditions.push(
      "(item_name LIKE ? OR category LIKE ? " +
        "OR location LIKE ? OR description LIKE ?)",
    );

    const keyword = `%${search}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  let sql = `
        SELECT
            id,
            report_type,
            item_name,
            category,
            item_date,
            location,
            description,
            created_at
        FROM item_reports
    `;

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += " ORDER BY created_at DESC, id DESC LIMIT 100";

  try {
    const [reports] = await pool.execute(sql, params);

    return res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Fetching reports failed:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve reports.",
    });
  }
}

module.exports = {
  createReport,
  getReports,
};
