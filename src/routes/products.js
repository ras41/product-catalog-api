const express = require("express");
const router = express.Router();

const pool = require("../db/db");

router.get("/", async (req, res) => {
  try {

    // -----------------------------
    // Query Parameters
    // -----------------------------
    const category = req.query.category || null;

    const cursorUpdatedAt =
      req.query.cursorUpdatedAt || null;

    const cursorId =
      req.query.cursorId
        ? Number(req.query.cursorId)
        : null;

    const limit = Math.min(
      Number(req.query.limit) || 20,
      100
    );

    // -----------------------------
    // Base Query
    // -----------------------------
    let query = `
      SELECT *
      FROM products
    `;

    const where = [];
    const values = [];

    // -----------------------------
    // Category Filter
    // -----------------------------
    if (category) {
      values.push(category);

      where.push(
        `category = $${values.length}`
      );
    }

    // -----------------------------
    // Cursor Pagination
    // -----------------------------
    if (cursorUpdatedAt && cursorId) {

      values.push(new Date(cursorUpdatedAt));

      const updatedAtIndex = values.length;

      values.push(cursorId);

      const idIndex = values.length;

      where.push(`
        (
          updated_at < $${updatedAtIndex}
          OR
          (
            updated_at = $${updatedAtIndex}
            AND id < $${idIndex}
          )
        )
      `);

    }

    // -----------------------------
    // WHERE
    // -----------------------------
    if (where.length) {
      query += `
        WHERE
        ${where.join(" AND ")}
      `;
    }

    // -----------------------------
    // ORDER
    // -----------------------------
    query += `
      ORDER BY
      updated_at DESC,
      id DESC
    `;

    // -----------------------------
    // LIMIT +1
    // -----------------------------
    values.push(limit + 1);

    query += `
      LIMIT $${values.length}
    `;

    // -----------------------------
    // Execute Query
    // -----------------------------
    const result =
      await pool.query(query, values);

    let products = result.rows;

    // -----------------------------
    // hasMore
    // -----------------------------
    const hasMore =
      products.length > limit;

    if (hasMore) {
      products.pop();
    }

    // -----------------------------
    // nextCursor
    // -----------------------------
    let nextCursor = null;

    if (products.length) {

      const last =
        products[products.length - 1];

      nextCursor = {
        updatedAt: last.updated_at,
        id: last.id,
      };

    }

    // -----------------------------
    // Response
    // -----------------------------
    res.json({

      success: true,

      count: products.length,

      hasMore,

      nextCursor,

      products,

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      message: "Failed to fetch products.",

    });

  }

});

module.exports = router;