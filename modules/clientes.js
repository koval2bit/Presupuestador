import { ClientsDB } from './db.js';
import { refreshClientsSelect } from '../assets/script.js';

let editingId = null;

export async function initClientes() {
    const section = document.getElementById('clients');

    section.innerHTML = `
        <div class="section-header">
            <h2>Gestión de Clientes</h2>
        </div>

        <div class="card">
            <form id="client-form">
                <input type="text" id="client-name" placeholder="Nombre completo" required>
                <input type="text" id="client-phone" placeholder="Teléfono (ej. 0985 750751)" required>
                <input type="email" id="client-email" placeholder="Email">
                <input type="text" id="client-address" placeholder="Dirección">
                <button type="submit">Agregar / Actualizar</button>
            </form>
        </div>

        <div id="client-list" class="list-container"></div>
    `;

    const form = section.querySelector('#client-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phone = form.querySelector('#client-phone').value.trim();
        if (!/^\d{4} \d{6}$/.test(phone)) {
            alert("Teléfono debe ser formato: 0985 750751");
            return;
        }

        const clientData = {
            name: form.querySelector('#client-name').value.trim(),
            phone,
            email: form.querySelector('#client-email').value.trim(),
            address: form.querySelector('#client-address').value.trim()
        };

        try {
            if (editingId) {
                await ClientsDB.update({ id: editingId, ...clientData });
                editingId = null;
            } else {
                await ClientsDB.add(clientData);
            }

            form.reset();
            await loadClients();
            refreshClientsSelect();

        } catch (err) {
            console.error(err);
            alert("Error al guardar cliente");
        }
    });

    /* Formato automático de teléfono */
    section.querySelector('#client-phone').addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        e.target.value = digits.length > 4
            ? digits.slice(0, 4) + ' ' + digits.slice(4)
            : digits;
    });

    await loadClients();
}

async function loadClients() {
    const container = document.getElementById('client-list');
    container.innerHTML = '';

    const clients = await ClientsDB.getAll();

    clients.forEach(client => {
        const div = document.createElement('div');
        div.classList.add('list-item');

        div.innerHTML = `
            <div>
                <strong>${client.name}</strong><br>
                ${client.phone}
            </div>
            <div>
                <button data-edit="${client.id}">Editar</button>
                <button data-delete="${client.id}">Eliminar</button>
            </div>
        `;

        container.appendChild(div);
    });

    container.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => editClient(btn.dataset.edit));
    });

    container.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => removeClient(btn.dataset.delete));
    });
}

async function editClient(id) {
    const client = await ClientsDB.getById(Number(id));
    if (!client) return;

    document.getElementById('client-name').value = client.name;
    document.getElementById('client-phone').value = client.phone;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-address').value = client.address || '';

    editingId = client.id;
}

async function removeClient(id) {
    if (!confirm("¿Eliminar cliente?")) return;

    try {
        await ClientsDB.delete(Number(id));
        await loadClients();
        refreshClientsSelect();
    } catch (err) {
        console.error(err);
        alert("Error al eliminar cliente");
    }
}
