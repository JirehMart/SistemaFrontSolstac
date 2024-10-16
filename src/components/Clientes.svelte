<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let clientes = [];
  let filteredClientes = [];
  let searchTerm = '';
  let dni_ruc = '';
  let nombre = '';
  let direccion = '';
  let telefono = '';
  let correo = '';
  let clienteId = null;
  let error = '';
  let loading = false; // Estado de carga

  // Obtener el token de localStorage
  const token = localStorage.getItem('token');

  onMount(async () => {
    await obtenerClientes();
  });

  async function obtenerClientes() {
    loading = true; // Iniciar la animación de carga
    try {
      const res = await fetch('http://localhost:3000/clientes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        clientes = await res.json();
        filteredClientes = clientes; // Inicialmente, todos los clientes están en la lista filtrada
        error = ''; // Limpiar cualquier error previo si la conexión es exitosa
      } else {
        error = 'Error al obtener clientes';
      }
    } catch (err) {
      error = 'Error de red al obtener clientes';
    } finally {
      loading = false; // Detener la animación de carga
    }
  }

  function filterClientes() {
    if (searchTerm.trim() === '') {
      filteredClientes = clientes;
    } else {
      filteredClientes = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.dni_ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.correo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  async function reconectarYActualizar() {
    await obtenerClientes(); // Intentar reconectar y obtener los clientes
  }

  async function agregarCliente() {
    error = '';
    const cliente = { dni_ruc, nombre, direccion, telefono, correo };
    try {
      const res = await fetch('http://localhost:3000/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cliente)
      });
      if (res.ok) {
        const nuevoCliente = await res.json();
        clientes = [...clientes, { ...cliente, id: nuevoCliente.id }];
        filteredClientes = clientes;
        limpiarFormulario();
      } else {
        error = 'Error al agregar cliente';
      }
    } catch (err) {
      error = 'Error de red al agregar cliente';
    }
  }

  async function actualizarCliente() {
    error = '';
    const confirmEdit = window.confirm("¿Estás seguro de que quieres actualizar este cliente?");
    if (!confirmEdit) {
      return; // Si el usuario cancela, no hacemos nada
    }
    
    const cliente = { dni_ruc, nombre, direccion, telefono, correo };
    try {
      const res = await fetch(`http://localhost:3000/clientes/${clienteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cliente)
      });
      if (res.ok) {
        const index = clientes.findIndex(c => c.id === clienteId);
        clientes[index] = { ...cliente, id: clienteId };
        filteredClientes = clientes;
        limpiarFormulario();
      } else {
        error = 'Error al actualizar cliente';
      }
    } catch (err) {
      error = 'Error de red al actualizar cliente';
    }
  }

  async function eliminarCliente(id) {
    error = '';
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este cliente?");
    if (!confirmDelete) {
      return; // Si el usuario cancela, no hacemos nada
    }

    try {
      const res = await fetch(`http://localhost:3000/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        clientes = clientes.filter(c => c.id !== id);
        filteredClientes = clientes;
      } else {
        error = 'Error al eliminar cliente verifique que no tenga elementos asociados';
      }
    } catch (err) {
      error = 'Error de red al eliminar cliente';
    }
  }

  function limpiarFormulario() {
    dni_ruc = '';
    nombre = '';
    direccion = '';
    telefono = '';
    correo = '';
    clienteId = null;
    error = '';  // Limpiar el mensaje de error
  }

  function editarCliente(cliente) {
    dni_ruc = cliente.dni_ruc;
    nombre = cliente.nombre;
    direccion = cliente.direccion;
    telefono = cliente.telefono;
    correo = cliente.correo;
    clienteId = cliente.id;
    error = '';
  }

  const navigateBack = () => {
    dispatch('navigate', 'dashboard');
  };
</script>

<main class="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
  <div class="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-md">
    <button on:click={navigateBack} class="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-200">
      Volver al Dashboard
    </button>

    <h1 class="text-3xl font-bold text-orange-600 mb-6">Gestión de Clientes</h1>

    <section>
      <h2 class="text-xl font-semibold text-gray-800 mb-4">{clienteId ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
      {#if error}
      <div class="bg-red-500 text-white p-3 mb-4 rounded-lg">
        {error}  <!-- Aquí se mostrará el mensaje de error -->
      </div>
    {/if}
      <form on:submit|preventDefault={clienteId ? actualizarCliente : agregarCliente} class="space-y-4">
        <div class="space-y-2">
          <label for="dni_ruc" class="block text-sm font-medium text-gray-700">DNI/RUC</label>
          <input
            type="text"
            id="dni_ruc"
            bind:value={dni_ruc}
            placeholder="Ingrese DNI/RUC"
            class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
            maxlength="20"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            id="nombre"
            bind:value={nombre}
            placeholder="Ingrese Nombre Completo"
            class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
            maxlength="30"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            type="text"
            id="direccion"
            bind:value={direccion}
            placeholder="Ingrese Dirección"
            class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
            maxlength="100"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="correo" class="block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            id="correo"
            bind:value={correo}
            placeholder="Ingrese Correo"
            class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
            maxlength="40"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            bind:value={telefono}
            placeholder="Ingrese Teléfono"
            class="border border-gray-300 p-2 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
            maxlength="9"
            required
          />
        </div>
        <div class="flex justify-between mt-4">
          <button
            type="submit"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 w-1/2 mr-2"
          >
            {clienteId ? 'Actualizar Cliente' : 'Agregar Cliente'}
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
  </div>

  <div class="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Lista de Clientes</h2>
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
      placeholder="Buscar clientes por nombre, DNI/RUC, dirección, teléfono o correo..."
      bind:value={searchTerm}
      on:input={filterClientes}
      class="mb-4 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border rounded-lg shadow-sm">
        <thead class="bg-gray-200 text-gray-600 text-left">
          <tr>
            <th class="py-2 px-4 border-b">Documento</th>
            <th class="py-2 px-4 border-b">Nombre Completo</th>
            <th class="py-2 px-4 border-b">Dirección</th>
            <th class="py-2 px-4 border-b">Correo</th>
            <th class="py-2 px-4 border-b">Teléfono</th>
            <th class="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredClientes as cliente}
          <tr class="hover:bg-gray-100 transition duration-200">
            <td class="py-2 px-4 border-b">{cliente.dni_ruc}</td>
            <td class="py-2 px-4 border-b">{cliente.nombre}</td>
            <td class="py-2 px-4 border-b">{cliente.direccion}</td>
            <td class="py-2 px-4 border-b">{cliente.correo}</td>
            <td class="py-2 px-4 border-b">{cliente.telefono}</td>
            <td class="py-2 px-4 border-b">
              <button on:click={() => editarCliente(cliente)} class="text-blue-600 hover:text-blue-800">Editar</button>
              <button on:click={() => eliminarCliente(cliente.id)} class="text-red-600 hover:text-red-800 ml-2">Eliminar</button>
            </td>            
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
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

  input {
    border: 1px solid #d1d5db;
    padding: 0.75rem;
    border-radius: 0.5rem;
    outline: none;
    transition: border-color 0.2s;
  }

  input:focus {
    border-color: #f97316;
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
</style>
