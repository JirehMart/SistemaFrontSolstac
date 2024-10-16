import Dashboard from '../components/Dashboard.svelte';
import Inventario from '../components/Inventario.svelte';
import Clientes from '../components/Clientes.svelte';
import Reportes from '../components/Reportes.svelte';
import Productos from '../components/Productos.svelte';
import Empleados from '../components/Empleados.svelte';

const routes = {
  '/': Dashboard,
  '/inventario': Inventario,
  '/clientes': Clientes,
  '/reportes': Reportes,
  '/productos': Productos,
  '/empleados': Empleados
};

export default routes;
