<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let productos = [];
  let filteredProductos = [];
  let searchTerm = "";
  let nombre = "";
  let stock = "";
  let codigo = "";
  let comentarios = "";
  let fecha_adquisicion = "";
  let precio_unitario = "";
  let observaciones = "";
  let precio_total = 0;
  let productoId = null;
  let error = "";
  let loading = false; // Estado de carga

  const token = localStorage.getItem("token");

  onMount(async () => {
    await obtenerProductos();
  });

  function formatearFecha(fecha) {
    if (!fecha) {
      return ""; // Maneja el caso donde la fecha es nula o indefinida
    }

    const date = new Date(fecha);

    if (isNaN(date.getTime())) {
      return "Fecha inválida"; // Devuelve un mensaje si la fecha es inválida
    }

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const año = date.getFullYear();

    return `${dia}/${mes}/${año}`;
  }

  async function obtenerProductos() {
    loading = true;
    try {
      const res = await fetch("http://localhost:3000/productos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        productos = await res.json();
        productos = productos.map((producto) => ({
          ...producto,
          fecha_adquisicion: formatearFecha(producto.fecha_adquisicion),
        }));
        filteredProductos = productos;

        // Verificar si algún producto tiene stock 0 y mostrar advertencia
        productos.forEach((producto) => {
          if (producto.stock === 0) {
            alert(
              `Advertencia: El producto con código ${producto.codigo} tiene un stock de 0. Por favor, reabastezca.`
            );
          }
        });
      } else {
        error = "Error al obtener productos";
      }
    } catch (err) {
      error = "Error de red al obtener productos";
    } finally {
      loading = false;
    }
  }

  function filterProductos() {
    if (searchTerm.trim() === "") {
      filteredProductos = productos;
    } else {
      filteredProductos = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.fecha_adquisicion.includes(searchTerm) ||
          producto.comentarios
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.observaciones
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          producto.stock.toString().includes(searchTerm) ||
          producto.precio_unitario.toFixed(2).includes(searchTerm) ||
          (producto.stock * producto.precio_unitario)
            .toFixed(2)
            .includes(searchTerm)
      );
    }
  }

  async function reconectarYActualizar() {
    await obtenerProductos(); // Intentar reconectar y obtener los productos
  }

  // Función para verificar el stock
  function verificarStock() {
    const stockNumero = parseInt(stock, 10); // Convertir stock a número entero

    if (isNaN(stockNumero)) {
      error = "El valor del stock debe ser un número válido.";
      return false;
    }

    if (stockNumero < 0) {
      error = "El stock no puede ser menor que 0.";
      return false;
    } else if (stockNumero === 0) {
      alert("Advertencia: El stock es 0, asegúrate de reabastecer.");
    } else if (stockNumero < 5) {
      alert("Advertencia: El stock es inferior a 5 unidades.");
    }

    return true;
  }

  async function agregarProducto() {
    if (!verificarStock() || !verificarPrecioUnitario()) {
      return; // Detener si la validación falla
    }

    const producto = {
      nombre,
      stock,
      codigo,
      comentarios,
      fecha_adquisicion,
      precio_total,
      precio_unitario,
      observaciones,
    };
    try {
      const res = await fetch("http://localhost:3000/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(producto),
      });
      if (res.ok) {
        const nuevoProducto = await res.json();
        productos = [...productos, { ...producto, id: nuevoProducto.id }];
        filteredProductos = productos;
        limpiarFormulario();
      } else {
        error = "Error al agregar producto";
      }
    } catch (err) {
      error = "Error de red al agregar producto";
    }
  }

  function verificarPrecioUnitario() {
    const precioNumero = parseFloat(precio_unitario); // Convertir precio_unitario a número flotante

    if (isNaN(precioNumero)) {
      error = "El valor del precio unitario debe ser un número válido.";
      return false;
    }

    if (precioNumero < 0) {
      error = "El precio unitario no puede ser menor que 0.";
      return false;
    }

    return true;
  }

  async function actualizarProducto() {
    if (!verificarStock() || !verificarPrecioUnitario()) {
      return; // Detener si la validación falla
    }

    const confirmUpdate = window.confirm(
      "¿Estás seguro de que quieres actualizar este producto?"
    );
    if (!confirmUpdate) {
      return; // Si el usuario cancela, salir de la función
    }

    const producto = {
      nombre,
      stock,
      codigo,
      comentarios,
      fecha_adquisicion,
      precio_total,
      precio_unitario,
      observaciones,
    };

    try {
      const res = await fetch(`http://localhost:3000/productos/${productoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(producto),
      });
      if (res.ok) {
        const index = productos.findIndex((p) => p.id === productoId);
        productos[index] = { ...producto, id: productoId };
        filteredProductos = productos;
        limpiarFormulario();
      } else {
        error = "Error al actualizar producto";
      }
    } catch (err) {
      error = "Error de red al actualizar producto";
    }
  }
  async function eliminarProducto(id) {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este producto?"
    );
    if (!confirmDelete) {
      return; // Si el usuario cancela, salir de la función
    }

    try {
      const res = await fetch(`http://localhost:3000/productos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        productos = productos.filter((p) => p.id !== id);
        filteredProductos = productos;
      } else {
        error = "Error al eliminar producto";
      }
    } catch (err) {
      error = "Error de red al eliminar producto";
    }
  }

  function limpiarFormulario() {
    nombre = "";
    stock = "";
    codigo = "";
    comentarios = "";
    fecha_adquisicion = "";
    precio_unitario = "";
    observaciones = "";
    productoId = null;
  }

  function editarProducto(producto) {
    nombre = producto.nombre;
    stock = producto.stock;
    codigo = producto.codigo;
    comentarios = producto.comentarios;
    fecha_adquisicion = producto.fecha_adquisicion;
    precio_unitario = producto.precio_unitario;
    observaciones = producto.observaciones;
    productoId = producto.id;
  }

  const navigateBack = () => {
    dispatch("navigate", "dashboard");
  };
</script>

<main
  class="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col lg:flex-row gap-6"
>
  <section class="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-md">
    <button
      on:click={navigateBack}
      class="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
    >
      Volver al Dashboard
    </button>

    <h1 class="text-2xl font-bold text-orange-600 mb-6">
      Gestión de Productos
    </h1>

    {#if error}
      <div class="bg-red-500 text-white p-3 mb-4 rounded-lg">
        {error}
      </div>
    {/if}

    <form
      on:submit|preventDefault={productoId
        ? actualizarProducto
        : agregarProducto}
      class="space-y-4"
    >
      <div class="space-y-2">
        <label for="nombre" class="block text-sm font-medium text-gray-700"
          >Nombre</label
        >
        <input
          type="text"
          id="nombre"
          bind:value={nombre}
          placeholder="Ingrese Nombre"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
          maxlength="30"
          required
        />
      </div>

      <div class="space-y-2">
        <label for="stock" class="block text-sm font-medium text-gray-700"
          >Stock</label
        >
        <input
          type="number"
          id="stock"
          bind:value={stock}
          placeholder="Ingrese Stock"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>

      <div class="space-y-2">
        <label for="codigo" class="block text-sm font-medium text-gray-700"
          >Código</label
        >
        <input
          type="text"
          id="codigo"
          bind:value={codigo}
          placeholder="Ingrese Código"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
          maxlength="15"
          required
        />
      </div>

      <div class="space-y-2">
        <label for="comentarios" class="block text-sm font-medium text-gray-700"
          >Comentarios</label
        >
        <textarea
          id="comentarios"
          bind:value={comentarios}
          placeholder="Ingrese Comentarios"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label
          for="fecha_adquisicion"
          class="block text-sm font-medium text-gray-700"
          >Fecha de Adquisición</label
        >
        <input
          type="date"
          id="fecha_adquisicion"
          bind:value={fecha_adquisicion}
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>

      <div class="space-y-2">
        <label
          for="precio_unitario"
          class="block text-sm font-medium text-gray-700">Precio Unitario</label
        >
        <input
          type="number"
          step="0.01"
          id="precio_unitario"
          bind:value={precio_unitario}
          placeholder="Ingrese Precio Unitario"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>

      <div class="space-y-2">
        <label
          for="observaciones"
          class="block text-sm font-medium text-gray-700">Observaciones</label
        >
        <textarea
          id="observaciones"
          bind:value={observaciones}
          placeholder="Ingrese Observaciones"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
        ></textarea>
      </div>

      <div class="flex justify-between mt-4">
        <button
          type="submit"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 w-1/2 mr-2"
        >
          {productoId ? "Actualizar Producto" : "Agregar Producto"}
        </button>
        <button
          type="button"
          on:click={limpiarFormulario}
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 w-1/2 ml-2"
        >
          Limpiar
        </button>
      </div>
    </form>
  </section>

  <section class="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Lista de Productos</h2>
      <!-- Botón de recarga -->
      <button
        on:click={reconectarYActualizar}
        class="p-2 text-gray-600 hover:text-gray-800 transition duration-200 focus:outline-none"
        aria-label="Recargar"
      >
        <img
          src="/reload.svg"
          alt="Recargar"
          class="w-6 h-6 {loading ? 'animate-spin' : ''}"
        />
      </button>
    </div>

    <input
      type="text"
      placeholder="Buscar por nombre, código, fecha, comentarios u observaciones..."
      bind:value={searchTerm}
      on:input={filterProductos}
      class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border rounded-lg shadow-sm">
        <thead class="bg-gray-200 text-gray-600 text-left">
          <tr>
            <th class="py-2 px-4 sm:px-6 border-b text-left">Código</th>
            <th class="py-2 px-4 sm:px-6 border-b text-left">Nombre</th>
            <th class="py-2 px-4 sm:px-6 border-b text-left"
              >Fecha Adquisición</th
            >
            <th class="py-2 px-4 sm:px-6 border-b text-left">Comentarios</th>
            <th class="py-2 px-4 sm:px-6 border-b text-left">Observaciones</th>
            <th class="py-2 px-4 sm:px-6 border-b text-left">Stock</th>
            <th class="py-2 px-4 sm:px-6 border-b text-left">Precio Unitario</th
            >
            <th class="py-2 px-4 sm:px-6 border-b text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredProductos as producto}
            <tr class="hover:bg-gray-100 transition duration-200">
              <td class="py-2 px-4 sm:px-6 border-b">{producto.codigo}</td>
              <td class="py-2 px-4 sm:px-6 border-b">{producto.nombre}</td>
              <td class="px-4 py-2 border-b">{producto.fecha_adquisicion}</td>
              <td class="py-2 px-4 sm:px-6 border-b">{producto.comentarios}</td>
              <td class="py-2 px-4 sm:px-6 border-b"
                >{producto.observaciones}</td
              >
              <td class="py-2 px-4 sm:px-6 border-b">{producto.stock}</td>
              <td class="py-2 px-4 sm:px-6 border-b"
                >{producto.precio_unitario.toFixed(2)}</td
              >
              <td class="py-2 px-4 sm:px-6 border-b">
                <button
                  on:click={() => editarProducto(producto)}
                  class="text-blue-600 hover:text-blue-800">Editar</button
                >
                <button
                  on:click={() => eliminarProducto(producto.id)}
                  class="text-red-600 hover:text-red-800 ml-2">Eliminar</button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</main>

<style>
  main {
    padding: 1.5rem;
  }
  section {
    width: 100%;
  }
  table {
    table-layout: auto;
  }

  button {
    border-radius: 0.5rem;
    transition:
      background-color 0.2s,
      transform 0.2s;
  }

  button:hover {
    transform: translateY(-2px);
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  input[type="text"] {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    width: 100%;
    margin-bottom: 1rem;
  }
</style>
