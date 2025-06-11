import { populateVersions } from "./populate-versions";
import "./style.css";


// Handle input method switching
function showInputSection() {
  // Hide all input sections
  document.querySelectorAll(".input-section").forEach((section) => {
    section.classList.add("d-none");
  });

  // Show selected input section
  const selectedRadio = document.querySelector(
    'input[name="inputMethod"]:checked',
  ) as HTMLInputElement;
  if (selectedRadio) {
    const selectedMethod = selectedRadio.value;
    const targetSection = document.getElementById(selectedMethod + "Input");
    if (targetSection) {
      targetSection.classList.remove("d-none");
    }
  }
}

// Helper functions for IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rrweb-storage', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events');
      }
    };
  });
}

function storeEventsInIndexedDB(events: any): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');

      store.put(events, 'rrweb-events');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    } catch (error) {
      reject(error);
    }
  });
}

// Handle form submission
async function handleFormSubmission(e: Event) {
  console.log("handleFormSubmission");
  e.preventDefault();

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const inputMethod = formData.get("inputMethod") as string;
  const version = formData.get("version") as string;
  const canvas = formData.has("canvas");
  const virtualDom = formData.has("virtual-dom");
  const play = formData.has("play");

  // Build URL parameters
  const params = new URLSearchParams();
  params.set("version", version);
  if (canvas) params.set("canvas", "true");
  if (virtualDom) params.set("virtual-dom", "true");
  if (play) params.set("play", "true");

  if (inputMethod === "url") {
    const url = formData.get("url") as string;
    if (!url) {
      alert("Please enter a URL");
      return;
    }
    params.set("url", url);
  } else {
    let eventsData;

    if (inputMethod === "file") {
      const file = formData.get("file") as File;
      if (!file || file.size === 0) {
        alert("Please select a file");
        return;
      }

      try {
        const text = await file.text();
        eventsData = JSON.parse(text);
      } catch (error) {
        alert("Invalid JSON file: " + (error as Error).message);
        return;
      }
    } else if (inputMethod === "paste") {
      const jsonContent = formData.get("jsonContent") as string;
      if (!jsonContent.trim()) {
        alert("Please paste JSON content");
        return;
      }

      try {
        eventsData = JSON.parse(jsonContent);
      } catch (error) {
        alert("Invalid JSON content: " + (error as Error).message);
        return;
      }
    }

    // Store events data in IndexedDB with fallback to sessionStorage
    try {
      await storeEventsInIndexedDB(eventsData);
      console.log("Events stored in IndexedDB");
    } catch (error) {
      console.warn("IndexedDB failed, trying sessionStorage:", error);
      throw error;
    }
    params.set("source", "local");
  }

  // Navigate to play page
  window.location.href = "play/index.html?" + params.toString();
}

function setupEventListeners() {
  // Set up event listeners for radio button changes
  document
    .querySelectorAll('input[name="inputMethod"]')
    .forEach((radio) => {
      radio.addEventListener("change", showInputSection);
    });

  // Handle form submission
  const eventsForm = document.getElementById("eventsForm");
  if (eventsForm) {
    eventsForm.addEventListener("submit", handleFormSubmission);
  }
}

function onLoad() {
  populateVersions();
  setupEventListeners();

  // Show the correct input section on page load
  setTimeout(showInputSection, 0);

  console.log("Welcome to rrwebdebug.com!");
}

// Show the correct input section on page load (handles browser back navigation)
// Use pageshow event and setTimeout to ensure browser has restored form state
window.addEventListener("pageshow", function () {
  setTimeout(showInputSection, 0);
});

document.addEventListener("DOMContentLoaded", onLoad);
