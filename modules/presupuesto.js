import { ClientsDB, ProductsDB, BudgetsDB } from './db.js';
import { formatGs, createPDF } from '../assets/script.js';

let currentItems = [];
let currentBudgetId = null;

/* ===============================
   Inicialización
================================ */
export async function initPresupuesto() {
    const section = document.getElementById('budgets');

    section.innerHTML = `
        <div class="section-header">
            <h2>Crear Presupuesto</h2>
            <button id="new-budget-btn" class="secondary-btn">Nuevo Presupuesto</button>
        </div>

        <div class="card">
            <form id="budget-form">
                <div class="form-row">
                    <label>N° Presupuesto:</label>
                    <span id="budget-number">-</span>
                </div>

                <select id="budget-client" required>
                    <option value="">Seleccionar cliente</option>
                </select>

                <button type="button" id="add-budget-item">+ Agregar Ítem</button>
                <div id="budget-items"></div>

                <textarea id="budget-notes" placeholder="Notas adicionales" rows="3"></textarea>

                <p class="total">Total: <span id="total">Gs 0</span></p>

                <div class="form-actions">
                    <button type="submit">Guardar</button>
                    <button type="button" id="generate-pdf">Generar PDF</button>
                </div>
            </form>
        </div>

        <h2>Presupuestos Guardados</h2>
        <div id="budget-list" class="list-container"></div>
    `;

    await loadClients();
    await loadBudgets();

    document.getElementById('add-budget-item').addEventListener('click', addItem);
    document.getElementById('budget-form').addEventListener('submit', saveBudget);
    document.getElementById('new-budget-btn').addEventListener('click', resetForm);
    document.getElementById('generate-pdf').addEventListener('click', generatePDF);

    generateBudgetNumber();
}

/* ===============================
   Cargar datos base
================================ */

async function loadClients() {
    const select = document.getElementById('budget-client');
    const clients = await ClientsDB.getAll();

    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

async function loadBudgets() {
    const container = document.getElementById('budget-list');
    container.innerHTML = '';

    const budgets = await BudgetsDB.getAll();

    budgets.forEach(b => {
        const div = document.createElement('div');
        div.classList.add('list-item');

        div.innerHTML = `
            <div>
                <strong>${b.number}</strong><br>
                Total: ${formatGs(b.total)}
            </div>
            <div>
                <button data-pdf="${b.id}">PDF</button>
                <button data-delete="${b.id}">Eliminar</button>
            </div>
        `;

        container.appendChild(div);
    });

    container.querySelectorAll('[data-pdf]').forEach(btn => {
        btn.addEventListener('click', () => exportPDF(btn.dataset.pdf));
    });

    container.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => deleteBudget(btn.dataset.delete));
    });
}

/* ===============================
   Presupuesto – Ítems
================================ */

async function addItem() {
    const products = await ProductsDB.getAll();

    const row = document.createElement('div');
    row.classList.add('budget-item');

    row.innerHTML = `
        <select class="item-product">
            <option value="">Producto</option>
            ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name}</option>`).join('')}
        </select>
        <input type="number" class="item-qty" min="1" value="1">
        <span class="item-subtotal">Gs 0</span>
        <button type="button" class="remove-item">X</button>
    `;

    document.getElementById('budget-items').appendChild(row);

    row.querySelector('.item-product').addEventListener('change', calculateTotal);
    row.querySelector('.item-qty').addEventListener('input', calculateTotal);
    row.querySelector('.remove-item').addEventListener('click', () => {
        row.remove()
