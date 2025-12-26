import { ProductsDB } from './db.js';
import { refreshProductSelects } from '../assets/script.js';

let editingId = null;

export async function initProductos() {
    const section = document.getElementById('products');

    section.innerHTML = `
        <div class="section-header">
            <h2>Gestión de Productos / Servicios</h2>
        </div>

        <div class="card">
            <form id="product-form">
                <input type="text" id="product-name" placeholder="Nombre" required>
                <input type="number" id="product-price" placeholder="Precio (Gs)" required min="0">
                <button type="submit">Agregar / Actualizar</button>
            </form>
        </div>

        <div id="product-list" class="list-container"></div>
    `;

    const form = section.querySelector('#product-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#product-name').value.trim();
        const price = parseInt(form.querySelector('#product-price').value, 10);

        if (!name || price < 0) {
            alert("Datos de producto inválidos");
            return;
        }

        const productData = { name, price };

        try {
            if (editingId) {
                await ProductsDB.update({ id: editingId, ...productData });
                editingId = null;
            } else {
                await ProductsDB.add(productData);
            }

            form.reset();
            await loadProductos();
            refreshProductSelects();

        } catch (err) {
            console.error(err);
            alert("Error al guardar producto");
        }
    });

    await loadProductos();
}

async function loadProductos() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    const products = await ProductsDB.getAll();

    products.forEach(product => {
        const div = document.createElement('div');
        div.classList.add('list-item');

        div.innerHTML = `
            <div>
                <strong>${product.name}</strong>
                — Gs ${new Intl.NumberFormat('es-PY').format(product.price)}
            </div>
            <div>
                <button data-edit="${product.id}">Editar</button>
                <button data-delete="${product.id}">Eliminar</button>
            </div>
        `;

        container.appendChild(div);
    });

    container.querySelectorAll('[data-edit]').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.edit));
    });

    container.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => removeProduct(btn.dataset.delete));
    });
}

async function editProduct(id) {
    const product = await ProductsDB.getById(Number(id));
    if (!product) return;

    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;

    editingId = product.id;
}

async function removeProduct(id) {
    if (!confirm("¿Eliminar producto?")) return;

    try {
        await ProductsDB.delete(Number(id));
        await loadProductos();
        refreshProductSelects();
    } catch (err) {
        console.error(err);
        alert("Error al eliminar producto");
    }
}