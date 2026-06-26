const main = document.querySelector("#content");
// fetch("http://localhost:3000")
//   .then((res) => res.json())
//   .then((data) => {
//     const ul = document.createElement("ul");
//     data.forEach((producto) => {
//       const li = document.createElement("li");
//       li.textContent = `${producto.nombre} - $${producto.precio}`;
//       ul.appendChild(li);
//     });
//     main.appendChild(ul);
//   });

// async function cargarProductos() {
//   try {
//     const res = await fetch("http://localhost:3000/products");
//     const data = await res.json();
//     const ul = document.createElement("ul");

//     data.forEach((producto) => {
//       const li = document.createElement("li");
//       li.textContent = `${producto.nombre} - $${producto.precio}`;
//       ul.appendChild(li);
//     });
//     main.appendChild(ul);
//   } catch (err) {
//     console.error("Error al cargar productos:", err);
//   }
// }z

// cargarProductos();

const API = "http://localhost:3000/api";

// ─── CARGAR CATEGORÍAS ─────────────────────────────────
// Se llama una vez al inicio para llenar los <select>
async function cargarCategorias() {
  const res = await fetch(`${API}/categorias`);
  const cats = await res.json();

  // Rellena ambos selectores (filtro y formulario)
  const opciones = cats
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");

  document.getElementById("select-categoria").innerHTML += opciones;
  document.getElementById("f-categoria").innerHTML += opciones;
}

// ─── CARGAR Y RENDERIZAR PRODUCTOS ────────────────────
// url puede ser cualquier endpoint: todos, filtrado, o búsqueda
async function cargarProductos(url) {
  try {
    const res = await fetch(url);
    const productos = await res.json();

    const contenedor = document.getElementById("lista-productos");

    if (productos.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    contenedor.innerHTML = productos
      .map(
        (p) => `
      <div class="producto-card">
        <div class="producto-info">
          <strong>${p.nombre}</strong>
          <span class="categoria">${p.categoria_nombre ?? "Sin categoría"}</span>
        </div>
        <div class="producto-datos">
          <span>$${Number(p.precio).toFixed(2)}</span>
          <span class="stock ${p.stock === 0 ? "sin-stock" : ""}">
            Stock: ${p.stock}
          </span>
        </div>
        <div class="producto-acciones">
          <input type="number" min="0" placeholder="Nuevo stock"
                 id="stock-${p.id}"">
          <button onclick="actualizarStock(${p.id})">Actualizar</button>
          <button onclick="eliminarProducto(${p.id})" class="btn-danger">Eliminar</button>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

async function cargarSugerencias(url, event) {
  const $sugerencias = document.querySelector(".sugerencias");
  const q = event.target.value;

  if (!q) {
    $sugerencias.innerHTML = "";
    return;
  }

  const res = await fetch(url);
  const productos = await res.json();

  $sugerencias.innerHTML = productos
    .map((p) => `<li class="item"><strong>${p.nombre}</strong></li>`)
    .join("");

  $sugerencias.addEventListener("click", (e) => {
    const item = e.target.closest("li");
    const q = item.querySelector("strong").textContent;

    cargarProductos(`${API}/productos/buscar?q=${encodeURIComponent(q)}`);
    $sugerencias.innerHTML = "";
    event.target.value = "";
  });
}

// ─── ACTUALIZAR STOCK ──────────────────────────────────
async function actualizarStock(id) {
  const input = document.getElementById(`stock-${id}`);
  const stock = Number(input.value);

  if (isNaN(stock) || stock < 0) {
    alert("Ingresa un stock válido");
    return;
  }

  await fetch(`${API}/productos/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });

  // Recarga la vista con el mismo filtro activo
  aplicarFiltro();
}

// ─── ELIMINAR PRODUCTO ─────────────────────────────────
async function eliminarProducto(id) {
  if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

  await fetch(`${API}/productos/${id}`, { method: "DELETE" });

  aplicarFiltro();
}

// ─── AGREGAR PRODUCTO ──────────────────────────────────
async function agregarProducto() {
  const nombre = document.getElementById("f-nombre").value.trim();
  const precio = document.getElementById("f-precio").value;
  const stock = document.getElementById("f-stock").value;
  const categoriaId = document.getElementById("f-categoria").value;

  if (!nombre || !precio) {
    alert("Nombre y precio son obligatorios");
    return;
  }

  const res = await fetch(`${API}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      categoria_id: categoriaId ? parseInt(categoriaId) : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert("Error: " + err.error);
    return;
  }

  // Limpia el formulario y recarga
  ["f-nombre", "f-precio", "f-stock"].forEach((id) => {
    document.getElementById(id).value = "";
  });

  aplicarFiltro();
}

// ─── APLICAR FILTRO ACTIVO ─────────────────────────────
// Función central: determina qué URL usar según el estado actual
function aplicarFiltro() {
  const categoriaId = document.getElementById("select-categoria").value;
  const url = categoriaId
    ? `${API}/productos?categoria=${categoriaId}`
    : `${API}/productos`;
  cargarProductos(url);
}

// ─── EVENTOS ───────────────────────────────────────────
document.getElementById("input-buscar").addEventListener("input", (e) => {
  const q = e.target.value;
  cargarSugerencias(`${API}/productos/buscar?q=${encodeURIComponent(q)}`, e);
});

document.getElementById("btn-buscar").addEventListener("click", () => {
  const q = document.getElementById("input-buscar").value.trim();
  if (!q) return;
  cargarProductos(`${API}/productos/buscar?q=${encodeURIComponent(q)}`);
});

document.getElementById("btn-todos").addEventListener("click", () => {
  document.getElementById("input-buscar").value = "";
  document.getElementById("select-categoria").value = "";
  cargarProductos(`${API}/productos`);
});

document
  .getElementById("select-categoria")
  .addEventListener("change", aplicarFiltro);
document
  .getElementById("btn-agregar")
  .addEventListener("click", agregarProducto);

// ─── INICIO ────────────────────────────────────────────
cargarCategorias();
cargarProductos(`${API}/productos`);
