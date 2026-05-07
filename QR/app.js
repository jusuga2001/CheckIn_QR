const STORAGE_KEY = "checkin_qr_attendees";
const EVENT_CAPACITY = 120;
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCEbHwkVynWC4-Fq8FYoXRRIRYSytSnI68",
  authDomain: "cheking-qr.firebaseapp.com",
  projectId: "cheking-qr",
  storageBucket: "cheking-qr.firebasestorage.app",
  messagingSenderId: "500449312156",
  appId: "1:500449312156:web:cefdd462aaf7a1636f5c59",
  measurementId: "G-3L6TQ0L2J5"
};

const sectionIds = [
  "homeSection",
  "registroSection",
  "dashboardSection",
  "scannerSection",
  "listaSection"
];

const elements = {
  form: document.getElementById("registroForm"),
  registroFeedback: document.getElementById("registroFeedback"),
  qrCard: document.getElementById("qrCard"),
  qrCode: document.getElementById("qrCode"),
  qrCodigoTexto: document.getElementById("qrCodigoTexto"),
  resultadoScan: document.getElementById("resultadoScan"),
  inputManual: document.getElementById("inputManual"),
  testButtonsContainer: document.getElementById("testButtonsContainer"),
  attendeesTableBody: document.getElementById("attendeesTableBody"),
  searchInput: document.getElementById("searchInput"),
  filterStatus: document.getElementById("filterStatus"),
  activityList: document.getElementById("activityList"),
  scannerActivityList: document.getElementById("scannerActivityList")
};

let attendees = loadAttendees();
let html5QrCode = null;
let firebaseClientPromise = null;

document.getElementById("btnRegistro").addEventListener("click", () => showSection("registroSection"));
document.getElementById("btnDashboard").addEventListener("click", () => showSection("dashboardSection"));
document.getElementById("btnScanner").addEventListener("click", () => showSection("scannerSection"));
document.getElementById("btnLista").addEventListener("click", () => showSection("listaSection"));
document.getElementById("btnVerificar").addEventListener("click", handleManualCheckIn);
document.getElementById("btnActivarCamara").addEventListener("click", startCameraScanner);
elements.form.addEventListener("submit", handleRegistration);
elements.searchInput.addEventListener("input", renderAttendeesTable);
elements.filterStatus.addEventListener("change", renderAttendeesTable);

document.querySelectorAll(".back").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.target || "homeSection");
  });
});

renderAll();

function showSection(sectionId) {
  sectionIds.forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== sectionId);
  });

  if (sectionId === "scannerSection") {
    refreshQuickTestButtons();
  }

  if (sectionId === "listaSection") {
    renderAttendeesTable();
  }

  if (sectionId === "dashboardSection") {
    renderDashboard();
  }
}

function loadAttendees() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("No se pudo leer el almacenamiento local:", error);
    }
  }

  const seed = buildSeedAttendees();
  saveAttendees(seed);
  return seed;
}

function saveAttendees(nextAttendees = attendees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAttendees));
}

function buildSeedAttendees() {
  const now = Date.now();

  return [
    {
      id: createId(),
      code: "ATT-001",
      nombre: "Laura",
      apellidos: "Mendoza",
      correo: "laura.mendoza@empresa.com",
      tipoDocumento: "Cedula",
      numeroDocumento: "10024567",
      fechaNacimiento: "1994-08-14",
      telefono: "3001112233",
      ticketType: "VIP",
      registeredAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      checkedIn: true,
      checkInAt: new Date(now - 1000 * 60 * 18).toISOString()
    },
    {
      id: createId(),
      code: "ATT-002",
      nombre: "Camilo",
      apellidos: "Vargas",
      correo: "camilo.vargas@empresa.com",
      tipoDocumento: "Cedula",
      numeroDocumento: "10028765",
      fechaNacimiento: "1989-05-21",
      telefono: "3002223344",
      ticketType: "General",
      registeredAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      checkedIn: true,
      checkInAt: new Date(now - 1000 * 60 * 42).toISOString()
    },
    {
      id: createId(),
      code: "ATT-003",
      nombre: "Sofia",
      apellidos: "Rojas",
      correo: "sofia.rojas@empresa.com",
      tipoDocumento: "DNI",
      numeroDocumento: "8899123",
      fechaNacimiento: "1997-11-09",
      telefono: "3003334455",
      ticketType: "Plus",
      registeredAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      checkedIn: false,
      checkInAt: null
    },
    {
      id: createId(),
      code: "ATT-004",
      nombre: "Mateo",
      apellidos: "Herrera",
      correo: "mateo.herrera@empresa.com",
      tipoDocumento: "Pasaporte",
      numeroDocumento: "PA-88192",
      fechaNacimiento: "1991-03-03",
      telefono: "3004445566",
      ticketType: "General",
      registeredAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      checkedIn: false,
      checkInAt: null
    },
    {
      id: createId(),
      code: "ATT-005",
      nombre: "Valentina",
      apellidos: "Reyes",
      correo: "valentina.reyes@empresa.com",
      tipoDocumento: "Cedula",
      numeroDocumento: "10039871",
      fechaNacimiento: "1995-01-17",
      telefono: "3005556677",
      ticketType: "VIP",
      registeredAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      checkedIn: true,
      checkInAt: new Date(now - 1000 * 60 * 8).toISOString()
    },
    {
      id: createId(),
      code: "ATT-006",
      nombre: "Nicolas",
      apellidos: "Pardo",
      correo: "nicolas.pardo@empresa.com",
      tipoDocumento: "DNI",
      numeroDocumento: "9911001",
      fechaNacimiento: "1990-06-28",
      telefono: "3006667788",
      ticketType: "Plus",
      registeredAt: new Date(now - 1000 * 60 * 45).toISOString(),
      checkedIn: false,
      checkInAt: null
    }
  ];
}

async function handleRegistration(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const attendee = {
    id: createId(),
    code: generateAttendeeCode(),
    nombre: (formData.get("nombre") || "").toString().trim(),
    apellidos: (formData.get("apellidos") || "").toString().trim(),
    correo: (formData.get("correo") || "").toString().trim(),
    tipoDocumento: (formData.get("tipoDocumento") || "").toString().trim(),
    numeroDocumento: (formData.get("numeroDocumento") || "").toString().trim(),
    fechaNacimiento: (formData.get("fechaNacimiento") || "").toString(),
    telefono: (formData.get("telefono") || "").toString().trim(),
    ticketType: (formData.get("ticketType") || "").toString().trim(),
    registeredAt: new Date().toISOString(),
    checkedIn: false,
    checkInAt: null
  };

  if (hasDuplicate(attendee)) {
    showFeedback(
      elements.registroFeedback,
      "error",
      "Ya existe un asistente con el mismo correo o numero de documento."
    );
    return;
  }

  attendees = [attendee, ...attendees];
  saveAttendees();
  renderAll();
  renderRegistrationResult(attendee);
  showFeedback(
    elements.registroFeedback,
    "success",
    `Registro completado para ${attendee.nombre} ${attendee.apellidos}. Codigo asignado: ${attendee.code}.`
  );
  elements.form.reset();
  await syncAttendeeToFirestore(attendee);
}

function hasDuplicate(candidate) {
  return attendees.some((attendee) => {
    return attendee.correo.toLowerCase() === candidate.correo.toLowerCase() ||
      attendee.numeroDocumento === candidate.numeroDocumento;
  });
}

function generateAttendeeCode() {
  const lastNumber = attendees.reduce((max, attendee) => {
    const numeric = Number.parseInt(attendee.code.replace("ATT-", ""), 10);
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);

  return `ATT-${String(lastNumber + 1).padStart(3, "0")}`;
}

function renderRegistrationResult(attendee) {
  elements.qrCard.classList.remove("hidden");
  elements.qrCode.innerHTML = "";
  elements.qrCodigoTexto.textContent = `${attendee.code} | ${attendee.nombre} ${attendee.apellidos}`;

  if (typeof QRCode === "function") {
    new QRCode(elements.qrCode, {
      text: attendee.code,
      width: 180,
      height: 180,
      colorDark: "#020617",
      colorLight: "#ffffff"
    });
  } else {
    elements.qrCode.textContent = attendee.code;
  }
}

function renderAll() {
  renderDashboard();
  renderScannerStats();
  renderAttendeesTable();
  renderActivityLists();
  refreshQuickTestButtons();
}

function renderDashboard() {
  const metrics = computeMetrics();
  document.getElementById("dashboardTotal").textContent = metrics.total;
  document.getElementById("dashboardCheckins").textContent = metrics.checkedIn;
  document.getElementById("dashboardPendientes").textContent = metrics.pending;
  document.getElementById("dashboardUltimaHora").textContent = metrics.lastHour;

  const progress = Math.min(100, Math.round((metrics.checkedIn / EVENT_CAPACITY) * 100));
  document.getElementById("dashboardProgressBar").style.width = `${progress}%`;
  document.getElementById("dashboardProgressLabel").textContent = `${progress}% ocupado`;
  document.getElementById("dashboardCapacidad").textContent = `${EVENT_CAPACITY} asistentes`;
  document.getElementById("dashboardActual").textContent = `${metrics.checkedIn} asistentes`;

  renderTicketBreakdown(metrics.ticketBreakdown, metrics.total);
}

function renderTicketBreakdown(breakdown, total) {
  const orderedTypes = ["General", "Plus", "VIP"];

  document.getElementById("ticketBreakdown").innerHTML = orderedTypes.map((type) => {
    const count = breakdown[type] || 0;
    const share = total === 0 ? 0 : Math.round((count / total) * 100);

    return `
      <div class="breakdown-item">
        <strong>${type}</strong>
        <div class="breakdown-meta">
          <span>${count} asistentes</span>
          <span>${share}% del registro</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderScannerStats() {
  const metrics = computeMetrics();
  document.getElementById("totalHoy").textContent = metrics.total;
  document.getElementById("checkinsHoy").textContent = metrics.checkedIn;
  document.getElementById("ultimaHora").textContent = metrics.lastHour;
  document.getElementById("pendientes").textContent = metrics.pending;
}

function renderAttendeesTable() {
  const searchValue = elements.searchInput.value.trim().toLowerCase();
  const filterValue = elements.filterStatus.value;

  const filtered = attendees.filter((attendee) => {
    const fullName = `${attendee.nombre} ${attendee.apellidos}`.toLowerCase();
    const matchesSearch = !searchValue ||
      attendee.code.toLowerCase().includes(searchValue) ||
      fullName.includes(searchValue) ||
      attendee.correo.toLowerCase().includes(searchValue);

    const matchesFilter = filterValue === "todos" ||
      (filterValue === "confirmado" && attendee.checkedIn) ||
      (filterValue === "pendiente" && !attendee.checkedIn);

    return matchesSearch && matchesFilter;
  });

  if (filtered.length === 0) {
    elements.attendeesTableBody.innerHTML = `
      <tr>
        <td class="empty-state" colspan="6">No hay asistentes que coincidan con los filtros actuales.</td>
      </tr>
    `;
    return;
  }

  elements.attendeesTableBody.innerHTML = filtered.map((attendee) => {
    const fullName = `${attendee.nombre} ${attendee.apellidos}`;
    const lastMovement = attendee.checkedIn ? attendee.checkInAt : attendee.registeredAt;

    return `
      <tr>
        <td>${attendee.code}</td>
        <td>${fullName}</td>
        <td>${attendee.ticketType}</td>
        <td>${attendee.correo}</td>
        <td>
          <span class="status-badge ${attendee.checkedIn ? "confirmado" : "pendiente"}">
            ${attendee.checkedIn ? "Check-in confirmado" : "Pendiente"}
          </span>
        </td>
        <td>${formatDate(lastMovement)}</td>
      </tr>
    `;
  }).join("");
}

function refreshQuickTestButtons() {
  const candidates = attendees.slice(0, 6);

  elements.testButtonsContainer.innerHTML = candidates.map((attendee) => {
    return `<button class="test-btn" type="button" data-code="${attendee.code}">${attendee.code}</button>`;
  }).join("");

  elements.testButtonsContainer.querySelectorAll(".test-btn").forEach((button) => {
    button.addEventListener("click", () => {
      processCode(button.dataset.code || "");
    });
  });
}

function handleManualCheckIn() {
  processCode(elements.inputManual.value);
  elements.inputManual.value = "";
}

function processCode(rawCode) {
  const code = (rawCode || "").trim().toUpperCase();

  if (!code) {
    updateScanResult("warning", "Ingresa un codigo antes de verificar.");
    return;
  }

  const attendeeIndex = attendees.findIndex((attendee) => attendee.code === code);

  if (attendeeIndex === -1) {
    updateScanResult("error", `Codigo invalido: ${code}`);
    return;
  }

  const attendee = attendees[attendeeIndex];

  if (attendee.checkedIn) {
    updateScanResult(
      "warning",
      `${attendee.nombre} ${attendee.apellidos} ya habia ingresado.`,
      `Ultimo check-in: ${formatDate(attendee.checkInAt)}`
    );
    return;
  }

  const updatedAttendee = {
    ...attendee,
    checkedIn: true,
    checkInAt: new Date().toISOString()
  };

  attendees.splice(attendeeIndex, 1, updatedAttendee);
  saveAttendees();
  renderAll();
  updateScanResult(
    "success",
    `Acceso permitido para ${updatedAttendee.nombre} ${updatedAttendee.apellidos}.`,
    `${updatedAttendee.code} | ${updatedAttendee.ticketType}`
  );
  syncCheckInToFirestore(updatedAttendee);
}

function updateScanResult(type, message, detail = "") {
  elements.resultadoScan.className = `scan-result ${type}`;
  elements.resultadoScan.innerHTML = detail ? `<strong>${message}</strong><br><span>${detail}</span>` : message;
}

function renderActivityLists() {
  const activityMarkup = buildActivityMarkup(getRecentActivity());
  elements.activityList.innerHTML = activityMarkup;
  elements.scannerActivityList.innerHTML = activityMarkup;
}

function buildActivityMarkup(items) {
  if (items.length === 0) {
    return `<div class="activity-item"><strong>Sin actividad</strong><div class="activity-meta"><span>Todavia no hay movimientos registrados.</span></div></div>`;
  }

  return items.map((item) => {
    return `
      <div class="activity-item">
        <strong>${item.title}</strong>
        <div class="activity-meta">
          <span>${item.detail}</span>
          <span>${formatDate(item.date)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function getRecentActivity() {
  return attendees.flatMap((attendee) => {
    const registrationActivity = {
      date: attendee.registeredAt,
      title: `${attendee.nombre} ${attendee.apellidos} se registro`,
      detail: `${attendee.code} | Entrada ${attendee.ticketType}`
    };

    const checkInActivity = attendee.checkedIn ? {
      date: attendee.checkInAt,
      title: `${attendee.nombre} ${attendee.apellidos} ingreso al evento`,
      detail: `${attendee.code} | Check-in confirmado`
    } : null;

    return [registrationActivity, checkInActivity].filter(Boolean);
  })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
}

function computeMetrics() {
  const checkedIn = attendees.filter((attendee) => attendee.checkedIn).length;
  const pending = attendees.length - checkedIn;
  const lastHourLimit = Date.now() - 1000 * 60 * 60;
  const lastHour = attendees.filter((attendee) => {
    return attendee.checkInAt && new Date(attendee.checkInAt).getTime() >= lastHourLimit;
  }).length;

  const ticketBreakdown = attendees.reduce((accumulator, attendee) => {
    accumulator[attendee.ticketType] = (accumulator[attendee.ticketType] || 0) + 1;
    return accumulator;
  }, {});

  return {
    total: attendees.length,
    checkedIn,
    pending,
    lastHour,
    ticketBreakdown
  };
}

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function showFeedback(target, type, message) {
  target.textContent = message;
  target.className = `feedback ${type}`;
  target.classList.remove("hidden");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `att-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function startCameraScanner() {
  if (typeof Html5Qrcode !== "function") {
    updateScanResult("error", "La libreria del scanner no esta disponible en este momento.");
    return;
  }

  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader");
    }

    const scanningState = globalThis.Html5QrcodeScannerState?.SCANNING ?? 2;
    const state = html5QrCode.getState ? html5QrCode.getState() : null;
    if (state === scanningState) {
      updateScanResult("warning", "La camara ya esta activa.");
      return;
    }

    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      async (decodedText) => {
        processCode(decodedText);

        if (html5QrCode) {
          try {
            await html5QrCode.stop();
          } catch (error) {
            console.warn("No se pudo detener la camara:", error);
          }
        }
      },
      () => {}
    );

    updateScanResult("neutral", "Camara activa. Esperando lectura del codigo...");
  } catch (error) {
    console.error("Error al activar la camara:", error);
    updateScanResult("error", "No fue posible activar la camara. Revisa permisos o usa la entrada manual.");
  }
}

async function getFirestoreClient() {
  if (firebaseClientPromise) {
    return firebaseClientPromise;
  }

  firebaseClientPromise = (async () => {
    const appModule = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js");
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js");
    const app = appModule.initializeApp(FIREBASE_CONFIG, "checkin-qr-web");
    const db = firestoreModule.getFirestore(app);

    return {
      addDoc: firestoreModule.addDoc,
      collection: firestoreModule.collection,
      db
    };
  })().catch((error) => {
    console.warn("Firebase no disponible. La app seguira funcionando en modo local.", error);
    firebaseClientPromise = null;
    return null;
  });

  return firebaseClientPromise;
}

async function syncAttendeeToFirestore(attendee) {
  const client = await getFirestoreClient();

  if (!client) {
    return;
  }

  try {
    await client.addDoc(client.collection(client.db, "asistentes"), attendee);
  } catch (error) {
    console.warn("No se pudo sincronizar el asistente con Firebase:", error);
  }
}

async function syncCheckInToFirestore(attendee) {
  const client = await getFirestoreClient();

  if (!client) {
    return;
  }

  try {
    await client.addDoc(client.collection(client.db, "asistencias"), {
      codigo: attendee.code,
      nombre: `${attendee.nombre} ${attendee.apellidos}`,
      ticketType: attendee.ticketType,
      fecha: attendee.checkInAt
    });
  } catch (error) {
    console.warn("No se pudo sincronizar el check-in con Firebase:", error);
  }
}
