<script>
  import Login from './components/Login.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Inventario from './components/Inventario.svelte';
  import Clientes from './components/Clientes.svelte';
  import Reportes from './components/Reportes.svelte';
  import Productos from './components/Productos.svelte';
  import Empleados from './components/Empleados.svelte';
  import Ventas from './components/Ventas.svelte';

  let token = localStorage.getItem('token');
  let isLoggedIn = !!token;
  let currentPage = 'dashboard';

  const handleLogin = (event) => {
    token = event.detail.token;
    isLoggedIn = true;
    currentPage = 'dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    token = null;
    isLoggedIn = false;
    currentPage = 'login';
  };

  const navigateTo = (page) => {
    currentPage = page;
  };

  const handleNavigate = (event) => {
    navigateTo(event.detail);
  };
</script>

<main class="min-h-screen flex flex-col p-0 m-0">
  {#if isLoggedIn}
    <div class="flex-1 overflow-auto">
      {#if currentPage === 'dashboard'}
        <Dashboard on:navigate={handleNavigate} />
      {:else if currentPage === 'inventario'}
        <Inventario on:navigate={handleNavigate} />
      {:else if currentPage === 'clientes'}
        <Clientes on:navigate={handleNavigate} />
      {:else if currentPage === 'reportes'}
        <Reportes on:navigate={handleNavigate} />
      {:else if currentPage === 'productos'}
        <Productos on:navigate={handleNavigate} />
      {:else if currentPage === 'empleados'}
        <Empleados on:navigate={handleNavigate} />
      {:else if currentPage === 'ventas'}
        <Ventas on:navigate={handleNavigate} />
      {/if}
    </div>
  {:else}
    <Login on:login={handleLogin} />
  {/if}
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }
  
</style>
