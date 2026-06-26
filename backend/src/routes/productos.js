import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET api/productos ----> Lista todos los productos y segun su categoria
// GET api/productos?categoria=1
router.get("/", async (req, res) => {
  const { categoria } = req.query; // si no viene es undefined

  try {
    let query, params;

    if (categoria) {
      //Si viene la categoria se hace la consulta con e filtro WHERE
      query = `
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.categoria_id = $1
        ORDER BY p.nombre;
            `;
      params = [categoria];
    } else {
      // Si no viene la categoria se hace la consulta sin el filtro
      query = `
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id
        ORDER BY p.nombre;
        `;
      params = [];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET api/productos/buscar?q=cable -----> Buscar productos por nombres
router.get("/buscar", async (req, res) => {
  const { q } = req.query;

  if (!q?.trim())
    return res.status(400).json({ error: "El parámetro es obligatorio" });

  try {
    const { rows } = await pool.query(
      ` SELECT p.*, c.nombre AS categoria_nombre 
        FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.nombre ILIKE $1
        ORDER BY p.nombre;
      `,
      [`%${q.trim()}%`],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET api/productos/id ----------> Buscar productos por su id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = $1;`,
      [id],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No encontramos esa cagada" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//POST api/productos -----------------> Agregar un nuevo producto
router.post("/", async (req, res) => {
  const { nombre, precio, stock, categoria_id } = req.body;

  if (!nombre?.trim())
    return res.status(400).json({ error: "El nombre es obligatorio" });

  if (precio == null || precio < 0)
    return res.status(400).json({ error: "El precio es obligatorio" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, precio, stock, categoria_id)
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      [nombre, precio, stock ?? 0, categoria_id ?? null],
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "Esa categoría no existe" });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH api/productos/id/stock ----------> Actualizar solo el stock de un producto
router.patch("/:id/stock", async (req, res) => {
  const { stock } = req.body;
  const { id } = req.params;

  if (stock === null || stock < 0)
    return res.status(400).json({ error: "El stock debe ser un numero >= 0" });

  try {
    const { rows } = await pool.query(
      `UPDATE productos SET stock = $1
       WHERE id = $2
       RETURNING *`,
      [stock, id],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No se encontro el producto" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE api/productos/id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `DELETE FROM productos WHERE id=$1 RETURNING *;`,
      [id],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No encontramos ese producto" });

    res.json({ message: "Producto eliminado", producto: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
