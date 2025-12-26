import { ConfigDB } from './db.js';

export async function initConfiguracion() {
    const section = document.getElementById('config');

    section.innerHTML = `
        <div class="section-header">
            <h2>Configuración</h2>
        </div>

        <div class="card">
            <form id="config-form">
                <label>Logo:</label>
                <input type="file" id="config-logo" accept="image/*">
                <img id="config-logo-preview"
                     style="display:none; max-width:150px; margin-top:10px;">

                <input type="text" id="config-owner" placeholder="Nombre del responsable" required>
                <input type="text" id="config-ruc" placeholder="RUC">
                <input type="email" id="config-email" placeholder="Email">
                <input type="text" id="config-phone" placeholder="Teléfono (ej. 0985 750751)">

                <h3>Redes Sociales</h3>
                <input type="text" id="config-facebook" placeholder="Facebook">
                <input type="text" id="config-instagram" placeholder="Instagram">
                <input type="text" id="config-whatsapp" placeholder="WhatsApp">

                <button type="submit">Guardar Configuración</button>
            </form>
        </div>
    `;

    const form = section.querySelector('#config-form');

    /* ===============================
       Cargar configuración
    ================================ */
    const currentConfig = await ConfigDB.get() || { id: 1 };

    fillForm(form, currentConfig);

    /* ===============================
       Guardar configuración
    ================================ */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            id: 1,
            owner: form.querySelector('#config-owner').value.trim(),
            ruc: form.querySelector('#config-ruc').value.trim(),
            email: form.querySelector('#config-email').value.trim(),
            phone: form.querySelector('#config-phone').value.trim(),
            facebook: form.querySelector('#config-facebook').value.trim(),
            instagram: form.querySelector('#config-instagram').value.trim(),
            whatsapp: form.querySelector('#config-whatsapp').value.trim(),
            logo: currentConfig.logo || null
        };

        try {
            await ConfigDB.update(data);
            alert("Configuración guardada correctamente");
        } catch (err) {
            console.error(err);
            alert("Error al guardar configuración");
        }
    });

    /* ===============================
       Logo (Base64)
    ================================ */
    form.querySelector('#config-logo').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            currentConfig.logo = ev.target.result;
            const img = form.querySelector('#config-logo-preview');
            img.src = currentConfig.logo;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    /* ===============================
       Formato teléfono
    ================================ */
    form.querySelector('#config-phone').addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        e.target.value = digits.length > 4
            ? digits.slice(0, 4) + ' ' + digits.slice(4)
            : digits;
    });
}

/* ===============================
   Utilidades
================================ */

function fillForm(form, data) {
    form.querySelector('#config-owner').value = data.owner || '';
    form.querySelector('#config-ruc').value = data.ruc || '';
    form.querySelector('#config-email').value = data.email || '';
    form.querySelector('#config-phone').value = data.phone || '';
    form.querySelector('#config-facebook').value = data.facebook || '';
    form.querySelector('#config-instagram').value = data.instagram || '';
    form.querySelector('#config-whatsapp').value = data.whatsapp || '';

    if (data.logo) {
        const img = form.querySelector('#config-logo-preview');
        img.src = data.logo;
        img.style.display = 'block';
    }
}
