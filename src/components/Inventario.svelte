<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let products = [];
  let filteredProducts = [];
  let searchTerm = '';
  let error = '';
  let loading = false; // Estado de carga

  // Obtener el token de localStorage
  const token = localStorage.getItem('token');

  // Cargar los productos cuando el componente se monte
  onMount(async () => {
    await obtenerProductos();
  });
  
  function formatearFecha(fecha) {
    if (!fecha) return ''; // Maneja el caso donde la fecha es nula o indefinida
    
    const [año, mes, dia] = fecha.split('T')[0].split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${año}`;
  }

  async function obtenerProductos() {
    loading = true; // Iniciar la animación de carga
    try {
      const res = await fetch('http://localhost:3000/productos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        products = await res.json();
        filteredProducts = products; // Inicialmente, todos los productos están en la lista filtrada
      } else {
        error = 'Error al obtener productos';
      }
    } catch (err) {
      error = 'Error de red al obtener productos';
    } finally {
      loading = false; // Detener la animación de carga
    }
  }

  function filterProducts() {
    if (searchTerm.trim() === '') {
      filteredProducts = products;
    } else {
      filteredProducts = products.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.comentarios?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.stock.toString().includes(searchTerm) ||
        product.precio_unitario.toFixed(2).includes(searchTerm) ||
        (product.stock * product.precio_unitario).toFixed(2).includes(searchTerm) ||
        formatearFecha(product.fecha_adquisicion).includes(searchTerm)
      );
    }
  }

  async function reconectarYActualizar() {
    await obtenerProductos(); // Intentar reconectar y obtener los productos
  }

  const navigateBack = () => {
    dispatch('navigate', 'dashboard'); // Emite el evento de navegación al dashboard
  };
</script>

<main class="flex min-h-screen bg-gray-100 p-4 sm:p-6 justify-center">
  <section class="w-full max-w-7xl bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <button on:click={navigateBack} class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
        Volver al Dashboard
      </button>
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

    <h2 class="text-3xl font-bold text-gray-800 mb-6">Inventario de Productos</h2>

    <input
      type="text"
      placeholder="Buscar productos por nombre, código, observaciones, stock, precios o fecha..."
      bind:value={searchTerm}
      on:input={filterProducts}
      class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />

    {#if filteredProducts.length === 0}
      <p class="text-gray-600">No hay productos registrados.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border rounded-lg shadow-sm">
          <thead>
            <tr class="bg-gray-200 text-gray-600 text-left">
              <th class="px-4 py-2 border-b">Código</th>
              <th class="px-4 py-2 border-b">Nombre</th>
              <th class="px-4 py-2 border-b">Fecha de Adquisición</th>
              <th class="px-4 py-2 border-b">Comentarios</th>
              <th class="px-4 py-2 border-b">Observaciones</th>
              <th class="px-4 py-2 border-b">Stock</th>
              <th class="px-4 py-2 border-b">Precio Unitario</th>
              <th class="px-4 py-2 border-b">Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredProducts as product}
              <tr class="hover:bg-gray-100 transition duration-200">
                <td class="px-4 py-2 border-b">{product.codigo}</td>
                <td class="px-4 py-2 border-b">{product.nombre}</td>
                <td class="px-4 py-2 border-b">{formatearFecha(product.fecha_adquisicion)}</td> <!-- Fecha en formato DD/MM/YYYY -->
                <td class="px-4 py-2 border-b">{product.comentarios}</td>
                <td class="px-4 py-2 border-b">{product.observaciones}</td>
                <td class="px-4 py-2 border-b">{product.stock}</td>
                <td class="px-4 py-2 border-b">{product.precio_unitario.toFixed(2)}</td>
                <td class="px-4 py-2 border-b">
                  {(product.stock * product.precio_unitario).toFixed(2)} <!-- Calcula el precio total -->
                </td>
              </tr>
            {/each}
          </tbody>          
        </table>
      </div>
    {/if}
  </section>
</main>

<style>
  main {
    padding: 1.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  button {
    border-radius: 0.5rem;
    transition: background-color 0.2s, transform 0.2s;
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
