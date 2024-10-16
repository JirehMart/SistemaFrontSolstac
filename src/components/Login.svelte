<script>
    import { createEventDispatcher } from 'svelte';
  
    let username = '';
    let password = '';
    let error = '';
    const dispatch = createEventDispatcher();
  
    const handleLogin = async () => {
      try {
        const response = await fetch('http://localhost:3000/administradores/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
  
        if (!response.ok) {
          const errorResponse = await response.json();
          console.log('Error response:', errorResponse);
          error = errorResponse.message || 'Contraseña o Usuario incorrecto';  // Asegúrate de manejar el mensaje de error
          return;
        }
  
        const data = await response.json();
        console.log('Success response:', data);
        localStorage.setItem('token', data.token);
        dispatch('login', { token: data.token }); // Dispatch login event to parent component
      } catch (err) {
        console.error('Network error:', err);
        error = 'Error de red. Inténtelo nuevamente.';
      }
    };
  </script>
  
  <main class="relative flex items-center justify-center min-h-screen bg-cover bg-center" style="background-image: url('fondo.png');">
    <div class="absolute inset-0 bg-black opacity-50"></div> <!-- Capa de superposición -->
    <div class="relative bg-white bg-opacity-85 rounded-lg shadow-md p-8 w-full max-w-sm z-10">
      <div class="flex justify-center mb-6">
        <img src="LogoSolstacH.png" alt="Logo" class="w-30 h-20 object-contain"/>
      </div>
      <h1 class="text-3xl font-bold mb-6 text-center text-orange-500">Iniciar Sesión</h1>
      {#if error}
        <div class="bg-red-500 text-white p-3 mb-4 rounded">
          {error}
        </div>
      {/if}
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label for="username" class="block text-md font-medium text-gray-700 mb-1">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            placeholder="Nombre de usuario"
            bind:value={username}
            class="border border-gray-300 p-2 rounded w-full focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-md font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            bind:value={password}
            class="border border-gray-300 p-2 rounded w-full focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>
        <button type="submit" class="bg-orange-500 text-white p-2 rounded w-full hover:bg-orange-600 transition duration-200">Iniciar Sesión</button>
      </form>
    </div>
  </main>
  
  <style>
    main {
      min-height: 100vh;
      overflow: hidden;
    }
  </style>
  