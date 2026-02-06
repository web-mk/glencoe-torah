document.addEventListener("DOMContentLoaded", () => {
  console.log("Community Torah landing page loaded");
});

const trigger = document.getElementById("videoTrigger");
const embed = document.getElementById("videoEmbed");
if (trigger && embed) {
  trigger.addEventListener("click", () => {
    embed.innerHTML = `
  <iframe 
    class="video__main"
    width="560"
    height="315"
    src="https://www.youtube.com/embed/8U_nLVItqdw?si=3wLFxdBhN1e4hBdA&autoplay=1&mute=1&controls=0&rel=0&playsinline=1"
    title="YouTube video player"
    frameborder="0"
    allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>`;
  
    trigger.style.display = "none";
    embed.hidden = false;
  });
}

// Donors Data Loader
(function () {
  "use strict";

  const API_URL =
    "https://data.webmk.co/?id=1GtsvnHx0eyTKD9oXRfuOlPiXCCHi2QBVt2OcWK-E4SA";

  let cachedDonors = [];

  async function fetchDonors() {
    const container = document.getElementById("donorsContainer");

    if (!container) {
      console.error("Donors container not found");
      return;
    }

    try {
      console.log("Fetching donors from API...");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      const rows = data.values.slice(1);

      const allDonors = rows
        .map((row) => ({
          name: row[0] || "",
          item: row[1] || "",
          dedication: row[2] || "",
        }))
        .filter((donor) => donor.name);

      console.log("Processed donors:", allDonors);

      if (allDonors.length === 0) {
        container.innerHTML = '<div class="error">No donors found.</div>';
        return;
      }

      cachedDonors = allDonors;
      renderDonors(allDonors);
    } catch (error) {
      console.error("Error fetching donors:", error);
      container.innerHTML = `<div class="error">Failed to load donors. Please try again later.<br><small>${error.message}</small></div>`;
    }
  }

  function formatItemType(item) {
    if (!item) return "";
    return item.toUpperCase();
  }

  function isMobileView() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function renderDonors(donors) {
    const container = document.getElementById("donorsContainer");
    container.innerHTML = "";

    const firstPattern = [5, 4, 3, 2];
    const middlePattern = [5, 5, 5, 5];
    const lastPattern = [5, 4, 3, 2];
    const mobilePattern = [4, 4, 4, 4];

    const LAST_TOTAL = 14;

    let index = 0;
    let gridCount = 0;
    const totalDonors = donors.length;

    while (index < totalDonors) {
      let pattern;
      const remaining = totalDonors - index;

      // MOBILE VIEW → equal layout
      if (isMobileView()) {
        pattern = mobilePattern;
      }
      // DESKTOP VIEW → stair logic
      else {
        if (gridCount === 0) {
          pattern = firstPattern;
        } else if (remaining <= LAST_TOTAL) {
          pattern = lastPattern;
        } else {
          pattern = middlePattern;
        }
      }

      const grid = document.createElement("div");
      grid.className = "donors__grid";
      container.appendChild(grid);

      pattern.forEach((colCount) => {
        const col = document.createElement("div");
        col.className = "donors__col";

        for (let i = 0; i < colCount && index < totalDonors; i++) {
          const donor = donors[index];

          const itemType = formatItemType(donor.item);
          const dedication = donor.dedication
            ? `<div class="dedication__to">${donor.dedication}</div>`
            : "";

          const card = document.createElement("div");
          card.className = "donors__card";
          card.innerHTML = `
            <div class="donors__type">${itemType}</div>
            <div class="donors__name">${donor.name}</div>
            ${dedication}
          `;

          col.appendChild(card);
          index++;
        }

        grid.appendChild(col);
      });

      gridCount++;
    }

    toggleDonorsGuide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchDonors);
  } else {
    fetchDonors();
  }

  const mediaQuery = window.matchMedia("(max-width: 768px)");

  function handleBreakpointChange() {
    if (cachedDonors.length) {
      renderDonors(cachedDonors);
    }
  }

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleBreakpointChange);
  } else {
    mediaQuery.addListener(handleBreakpointChange); // older browsers
  }
})();

function toggleDonorsGuide() {
  const donorsGrids = document.querySelectorAll(".donors__grid");
  const donorsGuide = document.querySelector(".donors__guide");

  if (!donorsGuide) return;

  donorsGuide.style.display = donorsGrids.length >= 2 ? "flex" : "none";
}

// ----------------------

const API_URL =
  "https://data.webmk.co/?id=1GtsvnHx0eyTKD9oXRfuOlPiXCCHi2QBVt2OcWK-E4SA&range=opportunities";

let dedicationsData = [];
let selectedDedications = new Map();

async function fetchDedications() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("API Error");
  return await response.json();
}

function parseAPIData(data) {
  const headers = data.values[0];
  const rows = data.values.slice(1);

  const nameIndex = headers.indexOf("Name");
  const priceIndex = headers.indexOf("Price");
  const descriptionIndex = headers.indexOf("Description");

  return rows.map((row, index) => {
    const name = row[nameIndex] || "";
    const price = parseFloat((row[priceIndex] || "$0").replace(/[$,]/g, ""));
    const description = row[descriptionIndex] || "";

    return {
      id: index,
      title: name,
      price,
      description,
      hasInput: name.toLowerCase() === "letter",
      inputLabel: "Number of letters*",
      inputValue: 0,
      isFeatured: name.toLowerCase() === "crown",
    };
  });
}

function formatCurrency(amount) {
  return "$" + amount.toLocaleString("en-US");
}

function renderDedications(list) {
  const grid = document.getElementById("dedicationGrid");
  grid.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");

    card.className = `dedication__card ${item.isFeatured ? "dedication__card--featured" : ""}`;
    card.dataset.id = item.id;

    let inputHTML = "";
    if (item.hasInput) {
      inputHTML = `
  <div class="dedication__input-section">
    <label class="dedication__input-label">${item.inputLabel}</label>

    <div class="dedication__input-wrapper">
      <span class="dedication__input-prefix">#</span>
      <input 
        type="number"
        class="dedication__input"
        value="${item.inputValue}"
        min="1"
        aria-label="Number of letters"
      />
    </div>
  </div>
`;
    }

    card.innerHTML = `
      <span class="dedication__checkbox"></span>
      <div class="dedication__card-content">
        <h3 class="dedication__title">${item.title} - ${formatCurrency(item.price)}</h3>
        <p class="dedication__description">${item.description}</p>
      </div>
      ${inputHTML}
    `;

    grid.appendChild(card);
  });
}

function updateTotalAmount() {
  let total = 0;

  selectedDedications.forEach((item) => {
    total += item.price * item.quantity;
  });

  document.getElementById("totalAmount").textContent = formatCurrency(total);
}

function autoSelectDefaultItems() {
  dedicationsData.forEach((item) => {
    if (
      item.title.toLowerCase() === "crown" ||
      item.title.toLowerCase() === "letter"
    ) {
      const card = document.querySelector(
        `.dedication__card[data-id="${item.id}"]`,
      );
      const input = card.querySelector(".dedication__input");
      const qty = input ? parseInt(input.value) || 1 : 1;

      selectedDedications.set(item.id, {
        ...item,
        quantity: qty,
      });

      card.classList.add("dedication__card--selected");
    }
  });

  updateTotalAmount();
}

function toggleDedication(card) {
  const id = Number(card.dataset.id);
  const dedication = dedicationsData.find((d) => d.id === id);

  if (selectedDedications.has(id)) {
    // if (selectedDedications.size === 1) {
    //   alert("At least one dedication must be selected.");
    //   return;
    // }

    selectedDedications.delete(id);
    card.classList.remove("dedication__card--selected");
  } else {
    let quantity = 1;
    const input = card.querySelector(".dedication__input");
    if (input) quantity = parseInt(input.value) || 1;

    selectedDedications.set(id, {
      ...dedication,
      quantity,
    });

    card.classList.add("dedication__card--selected");
  }

  updateTotalAmount();
}

function handleInputChange(card, value) {
  const id = Number(card.dataset.id);
  const dedication = dedicationsData.find((d) => d.id === id);
  const qty = parseInt(value) || 1;

  if (!selectedDedications.has(id)) {
    selectedDedications.set(id, { ...dedication, quantity: qty });
    card.classList.add("dedication__card--selected");
  } else {
    selectedDedications.get(id).quantity = qty;
  }

  updateTotalAmount();
}

document.getElementById("dedicationGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".dedication__card");
  if (!card) return;

  if (e.target.classList.contains("dedication__input")) return;

  toggleDedication(card);
});

document.getElementById("dedicationGrid").addEventListener("input", (e) => {
  if (!e.target.classList.contains("dedication__input")) return;

  const card = e.target.closest(".dedication__card");
  handleInputChange(card, e.target.value);
});

document.getElementById("payBtn").addEventListener("click", () => {
  if (selectedDedications.size === 0) {
    alert("Please select at least one dedication.");
    return;
  }

  const orderData = {
    items: Array.from(selectedDedications.values()),
    total: Array.from(selectedDedications.values()).reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    ),
  };

  console.log("Order:", orderData);
  alert("Proceeding to payment: " + formatCurrency(orderData.total));
});

async function init() {
  const loading = document.getElementById("loadingState");
  const error = document.getElementById("errorState");
  const grid = document.getElementById("dedicationGrid");

  try {
    const data = await fetchDedications();
    dedicationsData = parseAPIData(data);

    loading.style.display = "none";
    grid.style.display = "grid";

    renderDedications(dedicationsData);
    // autoSelectDefaultItems();
  } catch (err) {
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "Error loading data.";
  }
}

init();
