import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categorias ORDER BY nombre;",
    );
    res.json(rows);
    // console.log(rows);
  } catch (err) {
    console.error("Error al obtener categorías:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// POST /api/categorias
router.post("/", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El campo "nombre" es requerido' });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO categorias (nombre) VALUES ($1) RETURNING *;",
      [nombre],
    );
    // console.log(rows)
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear categoría:", err);
    res.status(500).json({ error: "Error al crear categoría" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "El id es requerido" });

  try {
    const { rows } = await pool.query(
      "DELETE FROM categorias WHERE id=$1 RETURNING *;",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la categoria" });
  }
});

export default router;
