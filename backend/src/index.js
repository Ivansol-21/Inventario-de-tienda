import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import routerProductos from "./routes/productos.js";
import routerCategories from "./routes/categorias.js";
// import figlet from "figlet";

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// Cada ruta maneja su propio endpoint
app.use("/api/categorias", routerCategories);
app.use("/api/productos", routerProductos);

// app.get("/nombre/:nombre", (req, res) => {
//   const { nombre } = req.params;

//   const LETRAS = {
//     A: [" * ", "* *", "***", "* *", "* *"],
//     B: ["** ", "* *", "** ", "* *", "** "],
//     C: ["***", "*  ", "*  ", "*  ", "***"],
//     D: ["** ", "* *", "* *", "* *", "** "],
//     E: ["***", "*  ", "***", "*  ", "***"],
//     " ": ["   ", "   ", "   ", "   ", "   "],
//     // ... todas las letras
//   };

//   function dibujarNombre(nombre) {
//     const letras = nombre
//       .toUpperCase()
//       .split("")
//       .map((c) => LETRAS[c] || ["???", "???", "???", "???", "???"]);
//     //                         ↑ fallback visible para detectar letras que faltan

//     let resultado = "";

//     for (let i = 0; i < 5; i++) {
//       resultado += letras.map((l) => l[i]).join("  ") + "\n";
//     }
//     return resultado;
//   }
//   const data = dibujarNombre(nombre);

//   res.type("text/plain");
//   res.send(data);
// });

// app.get("/nombre/:nombre", (req, res) => {
//   const { nombre } = req.params;

//   figlet(nombre, { font: "Banner" }, (err, data) => {
//     if (err) return res.status(500).send("Error generando el arte");

//     res.type("text/plain");
//     res.send(data);
//   });
// });

// Levantamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
