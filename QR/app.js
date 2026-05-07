
document.querySelector(".gray").addEventListener("click", () => {
  alert("Ir al dashboard");
});

document.querySelector(".green").addEventListener("click", () => {
  alert("Abrir scanner QR");
});

document.querySelector(".orange").addEventListener("click", () => {
  alert("Ver lista de asistentes");
});

const home = document.querySelector(".container");
const registro = document.getElementById("registroSection");

const btnRegistro = document.getElementById("btnRegistro");
const volver = document.getElementById("volverInicio");

// IR A REGISTRO
btnRegistro.addEventListener("click", () => {
  home.style.display = "none";
  registro.classList.remove("hidden");
});

// VOLVER AL HOME
volver.addEventListener("click", () => {
  registro.classList.add("hidden");
  home.style.display = "block";
});

const scannerSection = document.getElementById("scannerSection");
const btnScanner = document.getElementById("btnScanner");
const volverScanner = document.getElementById("volverInicioScanner");

// IR A SCANNER
btnScanner.addEventListener("click", () => {
  document.querySelector(".container").style.display = "none";
  scannerSection.classList.remove("hidden");
});

// VOLVER
volverScanner.addEventListener("click", () => {
  scannerSection.classList.add("hidden");
  document.querySelector(".container").style.display = "block";
});

let html5QrCode;

document.getElementById("btnActivarCamara").addEventListener("click", () => {

  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      mostrarResultado(decodedText);
      html5QrCode.stop();
    },
    (error) => { }
  );

});

function mostrarResultado(codigo) {

  const resultado = document.getElementById("resultadoScan");

  if (codigo.startsWith("ATT")) {
    resultado.innerHTML = `✅ Acceso permitido: ${codigo}`;

    total++;
    ultima++;
    pendientes = Math.max(0, pendientes - 1);

  } else {
    resultado.innerHTML = `❌ Código inválido`;
  }

  actualizarStats();
}

document.querySelectorAll(".test-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarResultado(btn.textContent);
  });
});

document.getElementById("btnVerificar").addEventListener("click", () => {
  const valor = document.getElementById("inputManual").value;
  mostrarResultado(valor);
});

let total = 95;
let ultima = 12;
let pendientes = 3;

function actualizarStats() {
  document.getElementById("totalHoy").textContent = total;
  document.getElementById("ultimaHora").textContent = ultima;
  document.getElementById("pendientes").textContent = pendientes;
}