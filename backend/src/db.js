import pg from "pg";
import dotenv from "dotenv/config";

const pool = process.env.DATABASE_URL
  ? new pg.pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new pg.Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

// Coneccion de prueba a la
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("✔ Conectado a la base de datos con exito.");
  }
});

export default pool;
