let usuariosSistema = [];
let eventos = [];
let asistentes = [];
let eventoSeleccionado = null;
let scannerActivo = null;

const loginSection = document.getElementById("loginSection");
const crearCuentaSection = document.getElementById("crearCuentaSection");
const homeSection = document.getElementById("homeSection");
const usuarioSection = document.getElementById("usuarioSection");
const registroSection = document.getElementById("registroSection");
const dashboardSection = document.getElementById("dashboardSection");
const scannerSection = document.getElementById("scannerSection");
const listaSection = document.getElementById("listaSection");

function ocultarTodo() {
  loginSection.classList.add("hidden");
  crearCuentaSection.classList.add("hidden");
  homeSection.classList.add("hidden");
  usuarioSection.classList.add("hidden");
  registroSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
  scannerSection.classList.add("hidden");
  listaSection.classList.add("hidden");
}

function volverLogin() {
  ocultarTodo();
  loginSection.classList.remove("hidden");

  document.getElementById("loginUsuario").value = "";
  document.getElementById("loginPassword").value = "";
}

document.getElementById("btnIrRegistroUsuario").addEventListener("click", () => {
  ocultarTodo();
  crearCuentaSection.classList.remove("hidden");
});

document.getElementById("volverLogin").addEventListener("click", volverLogin);

document.getElementById("btnCrearCuenta").addEventListener("click", () => {
  const usuario = document.getElementById("registroUsuario").value.trim();
  const password = document.getElementById("registroPassword").value.trim();

  if (!usuario || !password) {
    alert("Completa usuario y contraseña");
    return;
  }

  const existe = usuariosSistema.some(u => u.usuario === usuario);

  if (existe) {
    alert("Este usuario ya existe");
    return;
  }

  usuariosSistema.push({ usuario, password });

  alert("Cuenta creada correctamente");

  document.getElementById("registroUsuario").value = "";
  document.getElementById("registroPassword").value = "";

  volverLogin();
});

document.getElementById("btnIngresar").addEventListener("click", () => {
  const usuario = document.getElementById("loginUsuario").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const rol = document.getElementById("rolSelect").value;

  if (rol === "admin") {
    if (usuario === "admin" && password === "1234") {
      ocultarTodo();
      homeSection.classList.remove("hidden");
      actualizarDashboard();
      actualizarLista();
      return;
    }

    alert("Credenciales de administrador incorrectas");
    return;
  }

  const usuarioValido = usuariosSistema.find(
    u => u.usuario === usuario && u.password === password
  );

  if (!usuarioValido) {
    alert("Usuario o contraseña incorrectos");
    return;
  }

  ocultarTodo();
  usuarioSection.classList.remove("hidden");
  renderEventos();
});

document.getElementById("cerrarSesionAdmin").addEventListener("click", volverLogin);
document.getElementById("cerrarSesionUsuario").addEventListener("click", volverLogin);

document.getElementById("btnCrearEvento").addEventListener("click", () => {
  const nombre = document.getElementById("eventoNombre").value.trim();
  const fecha = document.getElementById("eventoFecha").value;

  if (!nombre || !fecha) {
    alert("Completa el nombre y la fecha del evento");
    return;
  }

  eventos.push({
    id: Date.now(),
    nombre,
    fecha
  });

  document.getElementById("eventoNombre").value = "";
  document.getElementById("eventoFecha").value = "";

  alert("Evento creado correctamente");
});

function renderEventos() {
  const container = document.getElementById("eventosContainer");
  container.innerHTML = "";

  if (eventos.length === 0) {
    container.innerHTML = `
      <article class="card">
        <h3>No hay eventos disponibles</h3>
        <p>Cuando el administrador cree eventos, aparecerán aquí.</p>
      </article>
    `;
    return;
  }

  eventos.forEach(evento => {
    container.innerHTML += `
      <article class="card">
        <span class="eyebrow">Evento disponible</span>
        <h3>${evento.nombre}</h3>
        <p><strong>Fecha:</strong> ${evento.fecha}</p>
        <button class="btn dark" type="button" onclick="abrirRegistroUsuario(${evento.id})">
          Registrarme
        </button>
      </article>
    `;
  });
}

function abrirRegistroUsuario(eventoId) {
  eventoSeleccionado = eventos.find(e => e.id === eventoId);

  ocultarTodo();
  registroSection.classList.remove("hidden");

  document.getElementById("registroForm").reset();
  document.getElementById("qrCard").classList.add("hidden");
  document.getElementById("registroFeedback").classList.add("hidden");
}

document.getElementById("volverEventosUsuario").addEventListener("click", () => {
  ocultarTodo();
  usuarioSection.classList.remove("hidden");
  renderEventos();
});

document.getElementById("registroForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!eventoSeleccionado) {
    alert("Selecciona un evento primero");
    return;
  }

  const codigo = `ATT-${Date.now()}`;

  const asistente = {
    codigo,
    nombre: document.getElementById("nombre").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    tipoDocumento: document.getElementById("tipoDocumento").value,
    numeroDocumento: document.getElementById("numeroDocumento").value.trim(),
    fechaNacimiento: document.getElementById("fechaNacimiento").value,
    telefono: document.getElementById("telefono").value.trim(),
    ticketType: document.getElementById("ticketType").value,
    eventoId: eventoSeleccionado.id,
    eventoNombre: eventoSeleccionado.nombre,
    estado: "pendiente",
    fechaRegistro: new Date().toLocaleString()
  };

  asistentes.push(asistente);

  const canvas = document.getElementById("qrCanvas");

  QRCode.toCanvas(canvas, codigo, function (error) {
    if (error) {
      alert("Error generando QR");
      return;
    }

    document.getElementById("qrCodigoTexto").textContent = codigo;
    document.getElementById("qrCard").classList.remove("hidden");
    document.getElementById("registroFeedback").classList.remove("hidden");
    document.getElementById("registroFeedback").textContent = "Registro completado correctamente.";
  });

  actualizarDashboard();
  actualizarLista();
});

document.getElementById("btnDescargarQR").addEventListener("click", () => {
  const canvas = document.getElementById("qrCanvas");

  if (!canvas || !canvas.toDataURL) {
    alert("Primero genera el QR");
    return;
  }

  const link = document.createElement("a");
  link.download = "mi-qr-checkin.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById("btnDashboard").addEventListener("click", () => {
  ocultarTodo();
  dashboardSection.classList.remove("hidden");
  actualizarDashboard();
});

document.getElementById("btnScanner").addEventListener("click", () => {
  ocultarTodo();
  scannerSection.classList.remove("hidden");
  actualizarScanner();
  renderTestButtons();
});

document.getElementById("btnLista").addEventListener("click", () => {
  ocultarTodo();
  listaSection.classList.remove("hidden");
  actualizarLista();
});

document.querySelectorAll("[data-target]").forEach(btn => {
  btn.addEventListener("click", () => {
    ocultarTodo();
    homeSection.classList.remove("hidden");
  });
});

function validarCodigo(codigo) {
  const resultado = document.getElementById("resultadoScan");
  const asistente = asistentes.find(a => a.codigo === codigo);

  if (!asistente) {
    resultado.textContent = "Código inválido";
    resultado.className = "scan-result danger";
    return;
  }

  if (asistente.estado === "confirmado") {
    resultado.textContent = `QR ya usado: ${asistente.nombre} ${asistente.apellidos}`;
    resultado.className = "scan-result danger";
    return;
  }

  asistente.estado = "confirmado";
  asistente.fechaCheckin = new Date().toLocaleString();

  resultado.textContent = `Acceso permitido: ${asistente.nombre} ${asistente.apellidos}`;
  resultado.className = "scan-result success";

  actualizarDashboard();
  actualizarScanner();
  actualizarLista();
}

document.getElementById("btnVerificar").addEventListener("click", () => {
  const codigo = document.getElementById("inputManual").value.trim();

  if (!codigo) {
    alert("Ingresa un código");
    return;
  }

  validarCodigo(codigo);
  document.getElementById("inputManual").value = "";
});

document.getElementById("btnActivarCamara").addEventListener("click", () => {
  if (scannerActivo) {
    scannerActivo.stop();
    scannerActivo = null;
  }

  scannerActivo = new Html5Qrcode("reader");

  scannerActivo.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      validarCodigo(decodedText);

      scannerActivo.stop();
      scannerActivo = null;
    },
    () => {}
  );
});

function actualizarDashboard() {
  const total = asistentes.length;
  const checkins = asistentes.filter(a => a.estado === "confirmado").length;
  const pendientes = total - checkins;
  const porcentaje = total === 0 ? 0 : Math.round((checkins / total) * 100);

  document.getElementById("dashboardTotal").textContent = total;
  document.getElementById("dashboardCheckins").textContent = checkins;
  document.getElementById("dashboardPendientes").textContent = pendientes;
  document.getElementById("dashboardUltimaHora").textContent = checkins;

  document.getElementById("dashboardProgressLabel").textContent = `${porcentaje}%`;
  document.getElementById("dashboardProgressBar").style.width = `${porcentaje}%`;

  const breakdown = document.getElementById("ticketBreakdown");
  breakdown.innerHTML = `
    <p>General: ${asistentes.filter(a => a.ticketType === "General").length}</p>
    <p>Plus: ${asistentes.filter(a => a.ticketType === "Plus").length}</p>
    <p>VIP: ${asistentes.filter(a => a.ticketType === "VIP").length}</p>
  `;

  const activity = document.getElementById("activityList");
  activity.innerHTML = asistentes.slice(-5).reverse().map(a => `
    <p>${a.nombre} ${a.apellidos} - ${a.estado}</p>
  `).join("");
}

function actualizarScanner() {
  const total = asistentes.length;
  const checkins = asistentes.filter(a => a.estado === "confirmado").length;
  const pendientes = total - checkins;

  document.getElementById("totalHoy").textContent = total;
  document.getElementById("checkinsHoy").textContent = checkins;
  document.getElementById("ultimaHora").textContent = checkins;
  document.getElementById("pendientes").textContent = pendientes;

  const list = document.getElementById("scannerActivityList");
  list.innerHTML = asistentes
    .filter(a => a.estado === "confirmado")
    .slice(-5)
    .reverse()
    .map(a => `<p>${a.nombre} ${a.apellidos} - ${a.fechaCheckin}</p>`)
    .join("");
}

function renderTestButtons() {
  const container = document.getElementById("testButtonsContainer");
  container.innerHTML = "";

  asistentes.slice(0, 4).forEach(a => {
    container.innerHTML += `
      <button class="test-btn" type="button" onclick="validarCodigo('${a.codigo}')">
        ${a.codigo}
      </button>
    `;
  });
}

function actualizarLista() {
  const tbody = document.getElementById("attendeesTableBody");

  if (!tbody) return;

  tbody.innerHTML = "";

  asistentes.forEach(a => {
    tbody.innerHTML += `
      <tr>
        <td>${a.codigo}</td>
        <td>${a.nombre} ${a.apellidos}</td>
        <td>${a.ticketType}</td>
        <td>${a.correo}</td>
        <td>${a.estado}</td>
        <td>${a.eventoNombre}</td>
      </tr>
    `;
  });
}
