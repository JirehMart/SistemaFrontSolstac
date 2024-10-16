<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let compras = [];
  let clientes = [];
  let productos = [];
  let cliente_id = "";
  let producto_id = "";
  let cantidad = "";
  let fecha = "";
  let precio = "";
  let compraId = null;
  let error = "";
  let loading = false;
  let searchTerm = ""; // Campo para la barra de búsqueda
  let filteredCompras = []; // Lista filtrada de compras

  const token = localStorage.getItem("token");

  onMount(async () => {
    await obtenerClientes();
    await obtenerProductos();
    await obtenerCompras();
  });

  const camposPermitidos = [
    "cliente_id",
    "producto_id",
    "cantidad",
    "fecha",
    "precio",
  ];

  async function obtenerClientes() {
    loading = true;
    try {
      const res = await fetch("http://localhost:3000/clientes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        clientes = await res.json();
      } else {
        error = "Error al obtener clientes";
      }
    } catch (err) {
      error = "Error de red al obtener clientes";
    } finally {
      loading = false;
    }
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
      } else {
        error = "Error al obtener productos";
      }
    } catch (err) {
      error = "Error de red al obtener productos";
    } finally {
      loading = false;
    }
  }

  async function obtenerCompras() {
    loading = true;
    try {
      const res = await fetch("http://localhost:3000/compras", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        compras = await res.json();
        filteredCompras = compras; // Inicializa la lista filtrada
      } else {
        error = "Error al obtener ventas";
      }
    } catch (err) {
      error = "Error de red al obtener ventas";
    } finally {
      loading = false;
    }
  }

  function getClienteNombre(cliente_id) {
    const cliente = clientes.find((c) => c.id === cliente_id);
    return cliente ? cliente.nombre : "Desconocido";
  }

  function formatearFecha(fecha) {
    if (!fecha) return "";
    const [año, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${año}`;
  }

  function getProductoNombre(producto_id) {
    const producto = productos.find((c) => c.id === producto_id);
    return producto ? producto.nombre : "Desconocido";
  }

  function validarCampos(compra) {
    for (let campo in compra) {
      if (!camposPermitidos.includes(campo)) {
        return false;
      }
    }
    return true;
  }

  async function agregarCompra() {
    const productoSeleccionado = productos.find(
      (producto) => producto.id === producto_id
    );

    // Verificar si la cantidad solicitada supera el stock disponible
    if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
      error = `No hay suficiente stock disponible. Solo quedan ${productoSeleccionado.stock} unidades.`;
      return;
    }

    const compra = {
      cliente_id,
      producto_id,
      cantidad,
      fecha,
      precio,
    };

    if (!validarCampos(compra)) {
      error = "Algunos campos no están permitidos.";
      return;
    }

    loading = true;
    try {
      const res = await fetch("http://localhost:3000/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(compra),
      });
      if (res.ok) {
        const nuevaCompra = await res.json();
        compras = [...compras, { ...compra, id: nuevaCompra.id }];
        filteredCompras = compras;
        limpiarFormulario();
      } else {
        error = "Error al agregar ventas";
      }
    } catch (err) {
      error = "Error de red al agregar ventas";
    } finally {
      loading = false;
    }
  }

  async function actualizarCompra() {
    const productoSeleccionado = productos.find(
      (producto) => producto.id === producto_id
    );

    // Verificar si la cantidad solicitada supera el stock disponible
    if (productoSeleccionado && cantidad > productoSeleccionado.stock) {
      error = `No hay suficiente stock disponible. Solo quedan ${productoSeleccionado.stock} unidades.`;
      return;
    }

    error = "";
    const confirmEdit = window.confirm(
      "¿Estás seguro de que quieres actualizar esta venta?"
    );
    if (!confirmEdit) {
      return;
    }

    const compra = {
      cliente_id,
      producto_id,
      cantidad,
      fecha,
      precio,
    };

    if (!validarCampos(compra)) {
      error = "Algunos campos no están permitidos.";
      return;
    }

    loading = true;
    try {
      const res = await fetch(`http://localhost:3000/compras/${compraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(compra),
      });
      if (res.ok) {
        const index = compras.findIndex((c) => c.id === compraId);
        compras[index] = { ...compra, id: compraId };
        filteredCompras = compras;
        limpiarFormulario();
      } else {
        error = "Error al actualizar ventas";
      }
    } catch (err) {
      error = "Error de red al actualizar ventas";
    } finally {
      loading = false;
    }
  }

  async function eliminarCompra(id) {
    error = "";
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar esta venta?"
    );
    if (!confirmDelete) {
      return;
    }

    loading = true;
    try {
      const res = await fetch(`http://localhost:3000/compras/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        compras = compras.filter((c) => c.id !== id);
        filteredCompras = compras;
      } else {
        error = "Error al eliminar ventas";
      }
    } catch (err) {
      error = "Error de red al eliminar ventas";
    } finally {
      loading = false;
    }
  }

  function getPrecioUnitario(producto_id) {
    const producto = productos.find((p) => p.id === producto_id);
    return producto ? producto.precio_unitario : 0;
  }

  function calcularPrecioTotal(cantidad, precio_unitario, descuento) {
    const descuentoDecimal = descuento / 100;
    const precioConDescuento = precio_unitario * (1 - descuentoDecimal);
    return cantidad * precioConDescuento;
  }

  function limpiarFormulario() {
    cliente_id = "";
    producto_id = "";
    cantidad = "";
    fecha = "";
    precio = "";
    compraId = null;
    error = "";
  }

  function editarCompra(compra) {
    cliente_id = compra.cliente_id;
    producto_id = compra.producto_id;
    cantidad = compra.cantidad;
    fecha = compra.fecha.split("T")[0];
    precio = compra.precio;
    compraId = compra.id;
    error = "";
  }

  function filterCompras() {
    if (searchTerm.trim() === "") {
      filteredCompras = compras;
    } else {
      filteredCompras = compras.filter((compra) => {
        const clienteNombre = getClienteNombre(compra.cliente_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const productoNombre = getProductoNombre(compra.producto_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const fechaCompra = formatearFecha(compra.fecha.split("T")[0]).includes(
          searchTerm
        );
        const cantidadCompra = compra.cantidad
          .toString()
          .includes(searchTerm);
        const precioUnitario = getPrecioUnitario(compra.producto_id)
          .toFixed(2)
          .includes(searchTerm);
        const descuentoCompra = compra.precio.toString().includes(searchTerm);
        const precioTotalCompra = calcularPrecioTotal(
          compra.cantidad,
          getPrecioUnitario(compra.producto_id),
          compra.precio
        )
          .toFixed(2)
          .includes(searchTerm);

        return (
          clienteNombre ||
          productoNombre ||
          fechaCompra ||
          cantidadCompra ||
          precioUnitario ||
          descuentoCompra ||
          precioTotalCompra
        );
      });
    }
  }

  const navigateBack = () => {
    dispatch("navigate", "dashboard");
  };
</script>

<main
  class="min-h-screen bg-gray-50 p-6 sm:p-8 flex flex-col lg:flex-row gap-8"
>
  <section class="w-full max-w-xs bg-white p-6 rounded-lg shadow-lg">
    <button
      on:click={navigateBack}
      class="mb-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
    >
      Volver al Dashboard
    </button>

    <h1 class="text-2xl font-bold text-gray-800 mb-8">Gestión de Ventas</h1>

    {#if error}
      <div class="bg-red-500 text-white p-3 mb-4 rounded-lg">
        {error}
      </div>
    {/if}

    <form
      on:submit|preventDefault={compraId ? actualizarCompra : agregarCompra}
      class="space-y-6"
    >
      <div class="space-y-3">
        <label for="cliente_id" class="block text-sm font-medium text-gray-700"
          >Cliente</label
        >
        <select
          id="cliente_id"
          bind:value={cliente_id}
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="" disabled selected>Seleccione un Cliente</option>
          {#each clientes as cliente}
            <option value={cliente.id}>{cliente.nombre}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-3">
        <label for="producto_id" class="block text-sm font-medium text-gray-700"
          >Producto</label
        >
        <select
          id="producto_id"
          bind:value={producto_id}
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="" disabled selected>Seleccione un Producto</option>
          {#each productos as producto}
            <option value={producto.id}>{producto.nombre}</option>
          {/each}
        </select>
      </div>

      <div class="space-y-3">
        <label for="cantidad" class="block text-sm font-medium text-gray-700"
          >Cantidad</label
        >
        <input
          type="number"
          id="cantidad"
          bind:value={cantidad}
          placeholder="Ingrese Cantidad"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div class="space-y-3">
        <label for="fecha" class="block text-sm font-medium text-gray-700"
          >Fecha</label
        >
        <input
          type="date"
          id="fecha"
          bind:value={fecha}
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div class="space-y-3">
        <label for="precio" class="block text-sm font-medium text-gray-700">Descuento (%)</label>
        <input
          type="number"
          step="0.01"
          id="precio"
          bind:value={precio}
          placeholder="Ingrese Descuento (%)"
          class="border border-gray-300 p-2 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
          min="0"
          max="100"
          required
        />
      </div>

      <div class="flex justify-between mt-6">
        <button
          type="submit"
          class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 w-1/2 mr-2"
        >
          {compraId ? "Actualizar ventas" : "Agregar ventas"}
        </button>
        <button
          type="button"
          on:click={limpiarFormulario}
          class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 w-1/2 ml-2"
        >
          Limpiar
        </button>
      </div>
    </form>
  </section>

  <section
    class="w-full flex-1 bg-white p-6 rounded-lg shadow-lg overflow-x-auto"
  >
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Lista de Ventas</h2>
      <button
        on:click={obtenerCompras}
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
      placeholder="Buscar por cliente, producto, fecha, cantidad, precio unitario, descuento o precio total..."
      bind:value={searchTerm}
      on:input={filterCompras}
      class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />

    <table class="min-w-full bg-white border rounded-lg shadow-sm">
      <thead class="bg-gray-100 text-gray-700">
        <tr>
          <th class="px-4 py-2">Cliente</th>
          <th class="px-4 py-2">Producto</th>
          <th class="px-4 py-2">Fecha</th>
          <th class="px-4 py-2">Cantidad</th>
          <th class="px-4 py-2">Precio Unitario</th>
          <th class="px-4 py-2">Descuento</th>
          <th class="px-4 py-2">Precio Total</th>
          <th class="px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredCompras as compra}
          <tr class="hover:bg-gray-50 transition duration-200">
            <td class="px-4 py-2 border-b"
              >{getClienteNombre(compra.cliente_id)}</td
            >
            <td class="px-4 py-2 border-b"
              >{getProductoNombre(compra.producto_id)}</td
            >
            <td class="px-4 py-2 border-b"
              >{formatearFecha(compra.fecha.split("T")[0])}</td
            >
            <td class="px-4 py-2 border-b">{compra.cantidad}</td>
            <td class="px-4 py-2 border-b"
              >{getPrecioUnitario(compra.producto_id).toFixed(2)}</td
            >
            <td class="px-4 py-2 border-b">{compra.precio}%</td>
            <td class="px-4 py-2 border-b">{calcularPrecioTotal(compra.cantidad, getPrecioUnitario(compra.producto_id), compra.precio).toFixed(2)}</td>
            <td class="px-4 py-2 border-b">
              <button
                on:click={() => editarCompra(compra)}
                class="text-blue-500 hover:text-blue-700">Editar</button
              >
              <button
                on:click={() => eliminarCompra(compra.id)}
                class="text-red-500 hover:text-red-700 ml-2">Eliminar</button
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
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

  table th {
    text-align: left;
    font-weight: 600;
  }

  table td {
    text-align: left;
  }
</style>
