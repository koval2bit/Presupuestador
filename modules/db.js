/*************************************************
 * db.js – Capa de acceso a datos (IndexedDB)
 * Proyecto: PREsup
 *************************************************/

/* ===============================
   1. Inicialización de la DB
================================ */

let db;
let dbReady;

const DB_NAME = "PresupuestosDB";
const DB_VERSION = 4;

dbReady = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
        console.error("Error al abrir IndexedDB");
        reject("IndexedDB error");
    };

    request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
    };

    request.onupgradeneeded = (e) => {
        db = e.target.result;

        /* PRODUCTS */
        if (!db.objectStoreNames.contains("products")) {
            const store = db.createObjectStore("products", {
                keyPath: "id",
                autoIncrement: true
            });
            store.createIndex("name", "name", { unique: false });
            store.createIndex("active", "active", { unique: false });
        }

        /* CLIENTS */
        if (!db.objectStoreNames.contains("clients")) {
            const store = db.createObjectStore("clients", {
                keyPath: "id",
                autoIncrement: true
            });
            store.createIndex("name", "name", { unique: false });
            store.createIndex("active", "active", { unique: false });
        }

        /* BUDGETS */
        if (!db.objectStoreNames.contains("budgets")) {
            const store = db.createObjectStore("budgets", {
                keyPath: "id",
                autoIncrement: true
            });
            store.createIndex("clientId", "clientId", { unique: false });
            store.createIndex("date", "date", { unique: false });
            store.createIndex("status", "status", { unique: false });
        }

        /* CONFIG */
        if (!db.objectStoreNames.contains("config")) {
            const store = db.createObjectStore("config", { keyPath: "id" });
            store.add({ id: 1 });
        }
    };
});

/* ===============================
   2. CRUD genérico seguro
================================ */

async function getStore(storeName, mode = "readonly") {
    await dbReady;
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
}

export async function addRecord(storeName, data) {
    const store = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const req = store.add(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function updateRecord(storeName, data) {
    const store = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const req = store.put(data);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

export async function deleteRecord(storeName, id) {
    const store = await getStore(storeName, "readwrite");

    return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

export async function getRecord(storeName, id) {
    const store = await getStore(storeName);

    return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

export async function getAllRecords(storeName) {
    const store = await getStore(storeName);

    return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

/* ===============================
   3. API semántica por entidad
================================ */

/* CLIENTS */
export const ClientsDB = {
    getAll: () => getAllRecords("clients"),
    getById: (id) => getRecord("clients", id),
    add: (client) =>
        addRecord("clients", {
            ...client,
            active: true,
            createdAt: new Date().toISOString()
        }),
    update: (client) => updateRecord("clients", client),
    delete: (id) => deleteRecord("clients", id)
};

/* PRODUCTS */
export const ProductsDB = {
    getAll: () => getAllRecords("products"),
    getById: (id) => getRecord("products", id),
    add: (product) =>
        addRecord("products", {
            ...product,
            active: true,
            createdAt: new Date().toISOString()
        }),
    update: (product) => updateRecord("products", product),
    delete: (id) => deleteRecord("products", id)
};

/* BUDGETS */
export const BudgetsDB = {
    getAll: () => getAllRecords("budgets"),
    getById: (id) => getRecord("budgets", id),
    add: (budget) =>
        addRecord("budgets", {
            ...budget,
            status: budget.status || "draft",
            date: budget.date || new Date().toISOString(),
            createdAt: new Date().toISOString()
        }),
    update: (budget) => updateRecord("budgets", budget),
    delete: (id) => deleteRecord("budgets", id)
};

/* CONFIG */
export const ConfigDB = {
    get: () => getRecord("config", 1),
    update: (config) => updateRecord("config", config)
};
