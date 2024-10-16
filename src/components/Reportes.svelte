<script>
  import { onMount } from 'svelte';
  import jsPDF from 'jspdf'; // Biblioteca para generar PDFs
  import autoTable from 'jspdf-autotable'; // Extensión para generar tablas en PDF
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let compras = []; // Compras para la tabla izquierda
  let clientes = []; // Lista de clientes
  let productos = []; // Lista de productos
  let facturas = []; // Facturas para la tabla derecha
  let filteredCompras = [];
  let filteredFacturas = [];
  let searchTermCompras = ''; // Término de búsqueda para las compras
  let searchTermFacturas = ''; // Término de búsqueda para las facturas
  let errorCompras = '';
  let errorClientes = '';
  let errorProductos = '';
  let errorFacturas = '';
  let loadingCompras = false; // Estado de carga para Compras
  let loadingFacturas = false; // Estado de carga para Facturas

  const fetchComprasData = async () => {
    loadingCompras = true;
    try {
      const response = await fetch('http://localhost:3000/compras', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener datos de compras.');
      }
      compras = await response.json();
      filteredCompras = compras;
    } catch (err) {
      console.error('Error al cargar datos de compras:', err);
      errorCompras = 'Hubo un problema al cargar los datos de compras.';
    } finally {
      loadingCompras = false;
    }
  };

  const fetchClientesData = async () => {
    try {
      const response = await fetch('http://localhost:3000/clientes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener datos de clientes.');
      }
      clientes = await response.json();
    } catch (err) {
      console.error('Error al cargar datos de clientes:', err);
      errorClientes = 'Hubo un problema al cargar los datos de clientes.';
    }
  };

  const fetchProductosData = async () => {
    try {
      const response = await fetch('http://localhost:3000/productos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener datos de productos.');
      }
      productos = await response.json();
    } catch (err) {
      console.error('Error al cargar datos de productos:', err);
      errorProductos = 'Hubo un problema al cargar los datos de productos.';
    }
  };

  const fetchFacturasData = async () => {
    loadingFacturas = true;
    try {
      const response = await fetch('http://localhost:3000/facturas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) {
        throw new Error('Error al obtener datos de facturas.');
      }
      facturas = await response.json();
      filteredFacturas = facturas;
    } catch (err) {
      console.error('Error al cargar datos de facturas:', err);
      errorFacturas = 'Hubo un problema al cargar los datos de facturas.';
    } finally {
      loadingFacturas = false;
    }
  };

  onMount(() => {
    fetchClientesData();
    fetchProductosData();
    fetchComprasData();
    fetchFacturasData();
  });

  function getClienteNombre(cliente_id) {
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nombre : 'Desconocido';
  }

  function getProductoNombre(producto_id) {
    const producto = productos.find(p => p.id === producto_id);
    return producto ? producto.nombre : 'Desconocido';
  }

  function getPrecioUnitario(producto_id) {
    const producto = productos.find(p => p.id === producto_id);
    return producto ? producto.precio_unitario : 0;
  }

  function calcularPrecioTotal(cantidad, precioUnitario, descuento) {
    const descuentoDecimal = descuento / 100;
    const precioConDescuento = precioUnitario * (1 - descuentoDecimal);
    return cantidad * precioConDescuento;
  }

  function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString(); // Formato: "dd/mm/yyyy"
  }

  function filterCompras() {
    if (searchTermCompras.trim() === '') {
      filteredCompras = compras;
    } else {
      filteredCompras = compras.filter(compra =>
        formatearFecha(compra.fecha).includes(searchTermCompras) ||
        compra.cantidad.toString().includes(searchTermCompras) ||
        calcularPrecioTotal(compra.cantidad, getPrecioUnitario(compra.producto_id), compra.precio).toFixed(2).includes(searchTermCompras) ||
        getClienteNombre(compra.cliente_id).toLowerCase().includes(searchTermCompras.toLowerCase()) ||
        getProductoNombre(compra.producto_id).toLowerCase().includes(searchTermCompras.toLowerCase())
      );
    }
  }

  function filterFacturas() {
    if (searchTermFacturas.trim() === '') {
      filteredFacturas = facturas;
    } else {
      filteredFacturas = facturas.filter(factura =>
        formatearFecha(factura.fecha).includes(searchTermFacturas) ||
        factura.total.toFixed(2).includes(searchTermFacturas) ||
        factura.tipo.toLowerCase().includes(searchTermFacturas.toLowerCase()) ||
        getClienteNombre(factura.cliente_id).toLowerCase().includes(searchTermFacturas.toLowerCase()) || // Filtrar por nombre de cliente
        (factura.observaciones && factura.observaciones.toLowerCase().includes(searchTermFacturas.toLowerCase()))
      );
    }
  }

  const exportToPDF = (data, nombreReporte, columnas) => {
    const doc = new jsPDF();
    
    // Agregar imagen del logo
    const imgData = '/LogoSolstacH.png';
    doc.addImage(imgData, 'PNG', 14, 10, 50, 20);
    
    // Título del reporte
    doc.setFontSize(18);
    doc.text(nombreReporte, 70, 25);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: data.map(item => columnas.map(col => {
        if (col === 'Cliente') {
          return getClienteNombre(item.cliente_id);
        } else if (col === 'Producto') {
          return getProductoNombre(item.producto_id);
        } else if (col === 'Fecha') {
          return formatearFecha(item.fecha);
        } else if (col === 'Precio Total') {
          return calcularPrecioTotal(item.cantidad, getPrecioUnitario(item.producto_id), item.precio).toFixed(2);
        }
        return item[col.toLowerCase()];
      })),
      theme: 'striped',
      headStyles: {
        fillColor: [255, 102, 0], // Color Naranja para el encabezado
        textColor: [255, 255, 255], // Texto blanco
      },
      styles: {
        lineColor: [255, 102, 0], // Color Naranja para las líneas
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [255, 235, 204], // Tonos naranjas claros para filas alternas
      },
      tableLineColor: [255, 102, 0],
      tableLineWidth: 0.15,
    });

    doc.save(`${nombreReporte}.pdf`);
  };

  const navigateBack = () => {
    dispatch('navigate', 'dashboard'); // Emite el evento de navegación al dashboard
  };

  const recargarCompras = async () => {
    await fetchComprasData(); // Recargar la lista de compras
  };

  const recargarFacturas = async () => {
    await fetchFacturasData(); // Recargar la lista de facturas
  };
</script>

<main class="min-h-screen bg-gray-100 p-6">
  <button on:click={navigateBack} class="mb-4 bg-blue-500 text-white p-2 rounded">Volver al Dashboard</button>
  
  <div class="grid grid-cols-2 gap-6">
    <!-- Sección Izquierda (Compras) -->
    <section class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-700">Compras</h2>
        <!-- Botón de recarga para Compras -->
        <button 
          on:click={recargarCompras} 
          class="p-2 text-gray-600 hover:text-gray-800 transition duration-200 focus:outline-none"
          aria-label="Recargar Compras"
        >
          <img 
            src="/reload.svg" 
            alt="Recargar Compras" 
            class="w-6 h-6 {loadingCompras ? 'animate-spin' : ''}" 
          />
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar por cliente, producto, fecha, cantidad o precio..."
        bind:value={searchTermCompras}
        on:input={filterCompras}
        class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      {#if errorCompras || errorClientes || errorProductos}
        <p class="text-red-600">{errorCompras || errorClientes || errorProductos}</p>
      {/if}
      {#if filteredCompras.length === 0 && !errorCompras}
        <p class="text-gray-600">No hay compras registradas.</p>
      {:else}
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="border-b px-4 py-2 text-left text-gray-600">Cliente</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Producto</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Fecha</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Cantidad</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredCompras as compra}
              <tr>
                <td class="border-b px-4 py-2">{getClienteNombre(compra.cliente_id)}</td>
                <td class="border-b px-4 py-2">{getProductoNombre(compra.producto_id)}</td>
                <td class="border-b px-4 py-2">{formatearFecha(compra.fecha)}</td>
                <td class="border-b px-4 py-2">{compra.cantidad}</td>
                <td class="border-b px-4 py-2">{calcularPrecioTotal(compra.cantidad, getPrecioUnitario(compra.producto_id), compra.precio).toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
      <button on:click={() => exportToPDF(filteredCompras, 'Compras', ['Cliente', 'Producto', 'Fecha', 'Cantidad', 'Precio Total'])} class="mt-4 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition duration-200">
        Exportar a PDF
      </button>
    </section>

    <!-- Sección Derecha (Facturas) -->
    <section class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-700">Recibos</h2>
        <!-- Botón de recarga para Facturas -->
        <button 
          on:click={recargarFacturas} 
          class="p-2 text-gray-600 hover:text-gray-800 transition duration-200 focus:outline-none"
          aria-label="Recargar Facturas"
        >
          <img 
            src="/reload.svg" 
            alt="Recargar Facturas" 
            class="w-6 h-6 {loadingFacturas ? 'animate-spin' : ''}" 
          />
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar por cliente, fecha, total, tipo o observaciones..."
        bind:value={searchTermFacturas}
        on:input={filterFacturas}
        class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      {#if errorFacturas}
        <p class="text-red-600">{errorFacturas}</p>
      {/if}
      {#if filteredFacturas.length === 0 && !errorFacturas}
        <p class="text-gray-600">No hay facturas registradas.</p>
      {:else}
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="border-b px-4 py-2 text-left text-gray-600">Cliente</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Fecha</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Total</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Tipo</th>
              <th class="border-b px-4 py-2 text-left text-gray-600">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredFacturas as factura}
              <tr>
                <td class="border-b px-4 py-2">{getClienteNombre(factura.cliente_id)}</td> <!-- Mostrar nombre del cliente -->
                <td class="border-b px-4 py-2">{formatearFecha(factura.fecha)}</td>
                <td class="border-b px-4 py-2">{factura.total.toFixed(2)}</td>
                <td class="border-b px-4 py-2">{factura.tipo}</td>
                <td class="border-b px-4 py-2">{factura.observaciones || 'N/A'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
      <button on:click={() => exportToPDF(filteredFacturas, 'Recibos', ['Cliente', 'Fecha', 'Total', 'Tipo', 'Observaciones'])} class="mt-4 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 transition duration-200">
        Exportar a PDF
      </button>
    </section>
  </div>
</main>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 0.75rem;
    text-align: left;
  }
  th {
    background-color: #f9fafb;
    color: #4b5563;
  }
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  button {
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s;
  }
  button:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input[type="text"] {
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    width: 100%;
    margin-bottom: 1rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
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
</style>
