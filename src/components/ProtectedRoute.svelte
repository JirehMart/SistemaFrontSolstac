<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let component;
  const dispatch = createEventDispatcher();
  let token = localStorage.getItem('token');
  let isAuthenticated = !!token;

  onMount(() => {
    if (!isAuthenticated) {
      dispatch('logout');
    }
  });
</script>

{#if isAuthenticated}
  <svelte:component this={component} />
{:else}
  <p class="text-red-500">Acceso denegado. Por favor, inicia sesión.</p>
{/if}

<style>
  /* Agrega tus estilos aquí */
</style>
