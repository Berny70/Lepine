/*************************************************
 * Lepine - app.js
 *************************************************/

// ================= VERSION =====================
const APP_VERSION = "1.0.5";
console.log("Lepine version", APP_VERSION);
const versionSpan = document.getElementById("version");
if (versionSpan) {
  versionSpan.textContent = ` v${APP_VERSION}`;
}

// =============== SUPABASE ======================
const SUPABASE_URL = "https://XXXX.supabase.co";       // <-- À REMPLACER
const SUPABASE_KEY = "PUBLIC_ANON_KEY";                // <-- À REMPLACER

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
// Variables carte 
let map = null;
let marker = null;


// =============== ELEMENTS UI ===================
const photoBtn   = document.getElementById("photoBtn");
const photoInput = document.getElementById("photoInput");
const sendBtn    = document.getElementById("sendBtn");
const preview    = document.getElementById("preview");
const statusTxt  = document.getElementById("status");

// =============== ETAT ==========================
let resizedBlob = null;
let position = null;

// =============== AUTH ANONYME ==================
async function signInAnonymous() {
  const { error } = await supabaseClient.auth.signInAnonymously();
  if (error) {
    console.error("Auth error:", error);
  } else {
    console.log("Authentifié anonymement");
  }
}

signInAnonymous();

// =============== PHOTO =========================
photoBtn.onclick = () => {
  photoInput.click();
};

photoInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  statusTxt.textContent = "📸 Traitement de l’image…";
  resizedBlob = await resizeImage(file);

  preview.src = URL.createObjectURL(resizedBlob);
  preview.style.display = "block";

    statusTxt.textContent = "📍 Localisation…";
    position = await getLocation();

    if (position) {
    showMap(
        position.coords.latitude,
        position.coords.longitude,
        position.coords.accuracy
    );
}


  statusTxt.textContent = "✅ Prêt à envoyer";
});

// =============== ENVOI =========================
sendBtn.onclick = async () => {
  if (!resizedBlob) {
    alert("Aucune photo");
    return;
  }

  statusTxt.textContent = "☁️ Envoi en cours…";
  sendBtn.disabled = true;
  photoBtn.disabled = t
function showMap(lat, lon, accuracy) {
  const mapDiv = document.getElementById("map");
  mapDiv.style.display = "block";

  if (!map) {
    map = L.map("map", {
      zoomControl: false
    }).setView([lat, lon], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    marker = L.marker([lat, lon]).addTo(map);

    if (accuracy) {
      L.circle([lat, lon], {
        radius: accuracy,
        color: "#2c7be5",
        fillOpacity: 0.15
      }).addTo(map);
    }

  } else {
    map.setView([lat, lon], 16);
    marker.setLatLng([lat, lon]);
  }
}
