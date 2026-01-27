/***********************
 * Lepine - app.js
 ***********************/

// ===== VERSION =====
const APP_VERSION = "1.0.5";
document.getElementById("version").textContent = ` v${APP_VERSION}`;

// ===== SUPABASE =====
// ⚠️ REMPLACE CES VALEURS
const SUPABASE_URL = "https://XXXX.supabase.co";
const SUPABASE_KEY = "PUBLIC_ANON_KEY";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===== UI =====
const photoBtn   = document.getElementById("photoBtn");
const photoInput = document.getElementById("photoInput");
const sendBtn    = document.getElementById("sendBtn");
const preview    = document.getElementById("preview");
const statusTxt  = document.getElementById("status");

// ===== ETAT =====
let resizedBlob = null;
let position = null;
let map = null;
let marker = null;

// ===== AUTH =====
supabaseClient.auth.signInAnonymously();

// ===== CAMERA =====
photoBtn.onclick = () => photoInput.click();

photoInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  statusTxt.textContent = "📸 Traitement…";
  resizedBlob = await resizeImage(file);
  preview.src = URL.createObjectURL(resizedBlob);

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

// ===== ENVOI =====
sendBtn.onclick = async () => {
  if (!resizedBlob) return alert("Pas de photo");

  statusTxt.textContent = "☁️ Envoi…";

  const user = (await supabaseClient.auth.getUser()).data.user;
  const filename = `${user.id}_${Date.now()}.jpg`;

  await supabaseClient.storage
    .from("photos")
    .upload(filename, resizedBlob, {
      contentType: "image/jpeg"
    });

  await supabaseClient
    .from("captures")
    .insert({
      user_id: user.id,
      filename,
      lat: position?.coords.latitude ?? null,
      lon: position?.coords.longitude ?? null,
      accuracy: position?.coords.accuracy ?? null
    });

  statusTxt.textContent = "✅ Envoyé";
};

// ===== UTILS =====
function resizeImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      canvas.getContext("2d").drawImage(img, 0, 0, 640, 480);
      canvas.toBlob(b => resolve(b), "image/jpeg", 0.7);
    };
    img.src = URL.createObjectURL(file);
  });
}

function getLocation() {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true }
    );
  });
}

function showMap(lat, lon, accuracy) {
  const mapDiv = document.getElementById("map");
  mapDiv.style.display = "block";

  if (!map) {
    map = L.map("map").setView([lat, lon], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
    if (accuracy) {
      L.circle([lat, lon], {
        radius: accuracy,
        fillOpacity: 0.15
      }).addTo(map);
    }
  } else {
    map.setView([lat, lon], 16);
    marker.setLatLng([lat, lon]);
  }
}

// ===== SERVICE WORKER =====
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/Lepine/sw.js");
}
