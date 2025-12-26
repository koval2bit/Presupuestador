// Datos de ejemplo para presupuesto
const budgetData = {
    income: 0,
    expenses: 0,
    balance: 0
};

// Función para mostrar solo una sección específica
function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar solo la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Actualizar estado activo en navegación superior
    updateActiveNavItem(sectionId);
}

// Actualizar el elemento activo en la navegación
function updateActiveNavItem(sectionId) {
    // Remover clase active de todos los enlaces
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar clase active al enlace correspondiente
    const activeLink = document.querySelector(`[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Actualizar iconos del bottom nav
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeBottomItem = document.querySelector(`.bottom-nav-item[onclick*="${sectionId}"]`);
    if (activeBottomItem) {
        activeBottomItem.classList.add('active');
    }
}

// Inicializar la aplicación
function initApp() {
    // Mostrar solo la sección de presupuesto al cargar
    showSection('presupuesto');
    
    // Agregar event listeners a todos los enlaces de navegación
    setupNavigationListeners();
}

// Configurar listeners para navegación
function setupNavigationListeners() {
    // Navegación superior
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                const sectionId = onclick.match(/'([^']+)'/)[1];
                showSection(sectionId);
            }
        });
    });
    
    // Navegación inferior
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                const sectionId = onclick.match(/'([^']+)'/)[1];
                showSection(sectionId);
            }
        });
    });
}

// Funciones de presupuesto
function addIncome() {
    const amount = parseFloat(document.getElementById('income-amount').value);
    const description = document.getElementById('income-description').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingrese un monto válido');
        return;
    }
    
    budgetData.income += amount;
    budgetData.balance = budgetData.income - budgetData.expenses;
    
    updateBudgetDisplay();
    document.getElementById('income-amount').value = '';
    document.getElementById('income-description').value = '';
}

function addExpense() {
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingrese un monto válido');
        return;
    }
    
    budgetData.expenses += amount;
    budgetData.balance = budgetData.income - budgetData.expenses;
    
    updateBudgetDisplay();
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-description').value = '';
}

function updateBudgetDisplay() {
    document.getElementById('total-income').textContent = `$${budgetData.income.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${budgetData.expenses.toFixed(2)}`;
    document.getElementById('total-balance').textContent = `$${budgetData.balance.toFixed(2)}`;
    
    // Cambiar color del balance según sea positivo o negativo
    const balanceElement = document.getElementById('total-balance');
    if (budgetData.balance >= 0) {
        balanceElement.style.color = '#4CAF50';
    } else {
        balanceElement.style.color = '#f44336';
    }
}

// Cargar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
export async function refreshClientsSelect() {
    const select = document.getElementById('budget-client');
    if (!select) return;
    const clients = await getAllRecords('clients');
    select.innerHTML = '<option value="">Seleccionar cliente</option>';
    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        opt.dataset.info = JSON.stringify(c);
        select.appendChild(opt);
    });
}

export async function refreshProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    const products = await getAllRecords('products');
    selects.forEach(sel => {
        const current = sel.value;
        sel.innerHTML = '<option value="">Seleccionar producto</option>';
        products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (Gs ${formatGs(p.price)})`;
            opt.dataset.price = p.price;
            if (current == p.id) opt.selected = true;
            sel.appendChild(opt);
        });
    });
}

export function createPDF(client, items, total, notes = '', number = 'PRES-XXX') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    if (config.logo) {
        try {
            doc.addImage(config.logo, 'JPEG', 15, y, 40, 30);
            y += 35;
        } catch (e) {
            console.warn("Error al cargar logo en PDF");
        }
    }

    doc.setFontSize(20);
    doc.text("PRESUPUESTO", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(14);
    doc.text(number, 105, y, { align: "center" });
    y += 20;

    doc.setFontSize(12);
    doc.text(config.owner || 'Emprendedor', 20, y); y += 8;
    if (config.ruc) doc.text(`RUC: ${config.ruc}`, 20, y), y += 8;
    if (config.email) doc.text(`Email: ${config.email}`, 20, y), y += 8;
    if (config.phone) doc.text(`Tel: ${config.phone}`, 20, y), y += 8;
    if (config.facebook) doc.text(`FB: ${config.facebook}`, 20, y), y += 8;
    if (config.instagram) doc.text(`IG: @${config.instagram.replace('@','')}`, 20, y), y += 8;
    if (config.whatsapp) doc.text(`WA: ${config.whatsapp}`, 20, y), y += 8;

    y += 10;
    doc.text(`Cliente: ${client.name || 'Cliente'}`, 20, y); y += 10;
    doc.text(`Tel: ${client.phone || 'Sin teléfono'}`, 20, y); y += 20;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-PY')}`, 20, y); y += 20;

    doc.text("Descripción", 20, y);
    doc.text("Cant.", 100, y);
    doc.text("P.Unit", 130, y);
    doc.text("Subtotal", 170, y);
    y += 8;
    doc.line(20, y, 190, y); y += 10;

    items.forEach(item => {
        doc.text((item.name || '').substring(0,35), 20, y);
        doc.text(String(item.quantity || 0), 110, y);
        doc.text(`Gs ${formatGs(item.price || 0)}`, 130, y);
        doc.text(`Gs ${formatGs(item.subtotal || 0)}`, 170, y);
        y += 10;
    });

    if (notes) {
        y += 10;
        doc.text("Notas:", 20, y); y += 10;
        doc.text(notes, 25, y, { maxWidth: 160 });
        y += 20;
    }

    doc.setFontSize(18);
    doc.text(`TOTAL: Gs ${formatGs(total)}`, 170, y, { align: "right" });

    doc.save(`${number}_${(client.name || 'cliente').replace(/\s/g,'_')}.pdf`);
}

// Inicialización segura cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');
        });
    });

    // Inicializar todos los módulos
    await initPresupuesto();
    await initClientes();
    await initProductos();
    await initConfiguracion();

    // Cargar config y refrescar selects
    await loadConfigFromDB();
    await refreshClientsSelect();
    await refreshProductSelects();
});