<script>
  import { createEventDispatcher } from 'svelte';

  let logo = 'LogoSolstac.png';
  const dispatch = createEventDispatcher();

  const navigateTo = (section) => {
    dispatch('navigate', section);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
</script>

<main class="flex min-h-screen relative">
  <section
    class="relative w-1/2 flex items-center justify-center p-0 bg-cover bg-center"
    style="background-image: url('fondo.png');"
  >
    <div class="absolute inset-0 bg-black opacity-50"></div> <!-- Capa de superposición -->
    <img src={logo} alt="Logo" class="relative z-10 max-w-full max-h-full mb-6" />
  </section>

  <nav class="w-1/2 p-0 flex flex-col items-center justify-center bg-gradient-to-r from-orange-300 to-orange-100">
    <button 
      on:click={handleLogout} 
      class="absolute top-4 right-4 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-lg transition duration-200 z-20 border-2 border-red-800"
    >
      Cerrar Sesión
    </button>
    <ul class="space-y-6 w-full mt-12"> <!-- Se agregó mt-12 para asegurar espacio suficiente arriba -->
      <li class="flex justify-center">
        <button
          class="w-3/4 text-center text-lg font-semibold text-white hover:text-orange-600 hover:bg-white p-4 border border-orange-300 rounded-lg shadow hover:shadow-lg transition duration-200"
          on:click={() => navigateTo('inventario')}
        >
          Inventario
        </button>
      </li>
      <li class="flex justify-center">
        <button
          class="w-3/4 text-center text-lg font-semibold text-white hover:text-orange-600 hover:bg-white p-4 border border-orange-300 rounded-lg shadow hover:shadow-lg transition duration-200"
          on:click={() => navigateTo('clientes')}
        >
          Clientes
        </button>
      </li>
      <li class="flex justify-center">
        <button
          class="w-3/4 text-center text-lg font-semibold text-white hover:text-orange-600 hover:bg-white p-4 border border-orange-300 rounded-lg shadow hover:shadow-lg transition duration-200"
          on:click={() => navigateTo('reportes')}
        >
          Reportes
        </button>
      </li>
      <li class="flex justify-center">
        <button
          class="w-3/4 text-center text-lg font-semibold text-white hover:text-orange-600 hover:bg-white p-4 border border-orange-300 rounded-lg shadow hover:shadow-lg transition duration-200"
          on:click={() => navigateTo('productos')}
        >
          Productos
        </button>
      </li>
      <li class="flex justify-center">
        <button
          class="w-3/4 text-center text-lg font-semibold text-white hover:text-orange-600 hover:bg-white p-4 border border-orange-300 rounded-lg shadow hover:shadow-lg transition duration-200"
          on:click={() => navigateTo('ventas')}
        >
          Ventas
        </button>
      </li>
    </ul>
  </nav>
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }

  section {
    padding: 0;
    margin: 0;
    background-size: cover;
    background-position: center;
  }

  nav {
    padding: 0;
    margin: 0;
    background: linear-gradient(to right, #ffbb66, #ffcc99); /* Degradado más suave */
    position: relative;
  }

  ul, li {
    margin: 0;
    padding: 0;
  }

  button {
    font-size: 1.125rem; /* 18px */
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s;
    text-align: center;
    color: white;
    background-color: #ff9900; /* Naranja más suave */
    border: 2px solid white;
  }

  button:hover {
    color: #ff9900; /* Naranja más suave */
    background-color: white;
    border: 2px solid #ff9900; /* Naranja más suave */
  }

  .bg-red-600 {
    background-color: #e53e3e; /* Rojo más fuerte */
    border-color: #9b2c2c; /* Borde rojo oscuro */
  }

  .bg-red-600:hover {
    background-color: #c53030; /* Rojo más oscuro en hover */
  }

  img {
    max-width: 80%;
    max-height: 80%;
    position: relative;
    z-index: 10;
  }
</style>
