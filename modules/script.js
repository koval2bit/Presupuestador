import { initClientes } from './clientes.js';
import { initProductos } from './productos.js';
import { initPresupuesto } from './presupuesto.js';
import { initConfiguracion } from './configuracion.js';

const sections = {
    clients: initClientes,
    products: initProductos,
    budgets: initPresupuesto,
    config: initConfiguracion
};

function clearSections() {
    document.querySelectorAll('section').forEach(sec => {
        sec.innerHTML = '';
    });
}

async function loadSection(id) {
    clearSections();
    if (sections[id]) {
        await sections[id]();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            loadSection(btn.dataset.section);
        });
    });

    // Carga inicial
    loadSection('budgets');
});
