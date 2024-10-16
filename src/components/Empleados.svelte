<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  const navigateBack = () => {
    dispatch('back');
  };
</script>

<main class="min-h-screen bg-gray-100 p-6">
  <button on:click={navigateBack} class="mb-4 bg-blue-500 text-white p-2 rounded">Volver al Dashboard</button>
  <h1 class="text-3xl font-bold text-orange-600 mb-4">Empleados</h1>
  <p class="text-lg">Contenido de la página de Empleados.</p>
</main>

<style>
  main {
    padding: 1.5rem;
  }
</style>
