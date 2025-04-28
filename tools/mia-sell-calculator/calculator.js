let itemCounts = {};
let itemButtons = {};
let allSellersData = [];

// dOM elements
const searchInput = document.getElementById("searchInput");
const sellersContainer = document.querySelector(".sellers-container");
const totalValueElem = document.getElementById("totalValue");
const trueValueElem = document.getElementById("trueValue");
const topItemsList = document.getElementById("topItemsList");
const resetButton = document.getElementById("resetButton");
const saveLocalBtn = document.getElementById("saveLocalBtn");
const loadLocalBtn = document.getElementById("loadLocalBtn");
const exportClipboardBtn = document.getElementById("exportClipboardBtn");
const importClipboardBtn = document.getElementById("importClipboardBtn");
const modal = document.getElementById("popupModal");
const modalMessage = document.getElementById("modalMessage");
const closeModalBtn = document.getElementById("closeModal");

// show popup modal with a message
function showModal(message, modalType = "info") {
    modal.style.display = "block";
    modalMessage.textContent = message;

    const modalContent = document.querySelector(".modal-content");
    // different color for different types
    modalContent.style.backgroundColor = modalType === "error" ? "var(--danger)" : "var(--background-color)";

    setTimeout(() => {
        modal.style.display = "none";
    }, 2000); // auto-hide after 2 seconds
}

closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// recalculate totals and update the display
function calculateTotalValues() {
    let totalFraction = 0;
    let totalSets = 0;

    allSellersData.forEach((seller) => {
        seller.items.forEach((item) => {
            const count = itemCounts[item.name] || 0;
            const needed = item.quantity;
            totalFraction += count * (1 / needed);
            totalSets += Math.floor(count / needed);
        });
    });

    totalValueElem.textContent = totalFraction.toFixed(3);
    trueValueElem.textContent = totalSets;

    updateButtonStyles();
    updateTopItems();
}

// update button styles based on item counts
function updateButtonStyles() {
    allSellersData.forEach((seller) => {
        seller.items.forEach((item) => {
            const count = itemCounts[item.name] || 0;
            const needed = item.quantity;
            const enough = count >= needed;
            const uniqueKey = seller.name + "_" + item.name;
            const btn = itemButtons[uniqueKey];
            if (!btn) return;

            if (enough) {
                btn.classList.add("enough-to-sell");
            } else {
                btn.classList.remove("enough-to-sell");
            }

            if (count > 0) {
                btn.classList.add("has-items");
            } else {
                btn.classList.remove("has-items");
            }
        });
    });
}

// update the top items list based on item counts
function updateTopItems() {
    topItemsList.innerHTML = "";

    allSellersData.forEach((seller) => {
        const sellableItems = seller.items
            .map((item) => {
                const count = itemCounts[item.name] || 0;
                const sets = Math.floor(count / item.quantity);
                return { ...item, count, sets };
            })
            .filter((i) => i.sets > 0)
            .sort((a, b) => b.sets - a.sets);

        if (sellableItems.length > 0) {
            const container = document.createElement("div");
            container.classList.add("seller-top-items");

            const sellerTitle = document.createElement("h3");
            sellerTitle.textContent = seller.name;
            container.appendChild(sellerTitle);

            sellableItems.forEach((itemObj) => {
                const row = document.createElement("div");
                row.classList.add("sellable-item-row");

                const img = document.createElement("img");
                img.src = itemObj.imageUrl;
                img.alt = itemObj.name;
                img.classList.add("sellable-item-image");

                const textInfo = document.createElement("span");
                textInfo.textContent = `${itemObj.name} — ${itemObj.sets} OC`;

                row.appendChild(img);
                row.appendChild(textInfo);
                container.appendChild(row);
            });

            topItemsList.appendChild(container);
        }
    });
}

// reset all item counts and update the display
function resetAll() {
    for (const key in itemCounts) {
        itemCounts[key] = 0;
    }
    Object.keys(itemButtons).forEach((key) => {
        const btn = itemButtons[key];
        const countDisplay = btn.querySelector(".count-display");
        if (countDisplay) {
            countDisplay.textContent = "x0";
        }
        btn.style.display = "flex";
    });
    calculateTotalValues();
}

// handle left and right click events on item buttons
function handleLeftClick(e, item, countDisplay) {
    if (e.ctrlKey) {
        itemCounts[item.name] += 10; // add 10 if Ctrl is pressed
    } else if (e.shiftKey) {
        itemCounts[item.name] += 5; // add 5 if Shift is pressed
    } else {
        itemCounts[item.name] += 1; // add 1 otherwise
    }
    countDisplay.textContent = `x${itemCounts[item.name]}`;
    calculateTotalValues();
}

// handle right click events on item buttons
function handleRightClick(e, item, countDisplay) {
    e.preventDefault();
    let removeAmount = 1;
    if (e.ctrlKey) {
        removeAmount = 10; // remove 10 if Ctrl is pressed
    } else if (e.shiftKey) {
        removeAmount = 5; // remove 5 if Shift is pressed
    }
    const currentCount = itemCounts[item.name] || 0;
    const newCount = Math.max(currentCount - removeAmount, 0);
    itemCounts[item.name] = newCount;
    countDisplay.textContent = `x${newCount}`;
    calculateTotalValues();
}

// filter items based on search input
function filterItems() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    allSellersData.forEach((seller) => {
        seller.items.forEach((item) => {
            const uniqueKey = seller.name + "_" + item.name;
            const button = itemButtons[uniqueKey];
            if (!button) return;

            const matches = item.name.toLowerCase().includes(searchTerm);
            button.style.display = matches || searchTerm === "" ? "flex" : "none";
        });
    });
}

// save and load data to/from local storage
function saveToLocal() {
    try {
        localStorage.setItem("inventoryData", JSON.stringify(itemCounts));
        showModal("Saved!");
    } catch (err) {
        console.error("Error saving to localStorage", err);
        showModal("Error saving", "error");
    }
}

// load data from local storage
function loadFromLocal(silent = false) {
    try {
        const data = localStorage.getItem("inventoryData");
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed === "object") {
                itemCounts = parsed;
                Object.keys(itemButtons).forEach((key) => {
                    const btn = itemButtons[key];
                    if (!btn) return;
                    const countDisplay = btn.querySelector(".count-display");
                    const itemName = key.split("_").slice(1).join("_");
                    const currentCount = itemCounts[itemName] || 0;
                    if (countDisplay) {
                        countDisplay.textContent = "x" + currentCount;
                    }
                });
                calculateTotalValues();
                if (!silent) {
                    showModal("Loaded!");
                }
            }
        } else {
            if (!silent) {
                showModal("No saved data found.", "error"); // alert if no data
            }
        }
    } catch (err) {
        console.error("Error loading from localStorage", err);
        showModal("Error loading from local storage", "error");
    }
}

// export data to clipboard
async function exportToClipboard() {
    try {
        const dataStr = JSON.stringify(itemCounts);
        await navigator.clipboard.writeText(dataStr);
        showModal("Exported to clipboard!");
    } catch (err) {
        console.error("Error exporting to clipboard", err);
        showModal("Clipboard export failed.", "error");
    }
}

// import data from clipboard
async function importFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") {
            itemCounts = parsed;
            Object.keys(itemButtons).forEach((key) => {
                const btn = itemButtons[key];
                if (!btn) return;
                const countDisplay = btn.querySelector(".count-display");
                const itemName = key.split("_").slice(1).join("_");
                const currentCount = itemCounts[itemName] || 0;
                if (countDisplay) {
                    countDisplay.textContent = "x" + currentCount;
                }
            });
            calculateTotalValues();
            showModal("Imported from clipboard!");
        }
    } catch (err) {
        console.error("Error importing from clipboard", err);
        showModal("Clipboard import failed or invalid JSON.", "error");
    }
}

// fetch seller data from JSON file and populate the UI
fetch("./seller_data.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        allSellersData = data;

        data.forEach((seller) => {
            const sellerDiv = document.createElement("div");
            sellerDiv.classList.add("seller");

            const title = document.createElement("h2");
            title.textContent = seller.name;
            sellerDiv.appendChild(title);

            const container = document.createElement("div");
            container.classList.add("item-container");
            sellerDiv.appendChild(container);

            seller.items.forEach((item) => {
                if (!itemCounts[item.name]) {
                    itemCounts[item.name] = 0; // initialize count if not exists
                }

                const button = document.createElement("button");
                button.classList.add("item");
                button.title = item.name || "Item";

                const uniqueKey = seller.name + "_" + item.name;
                itemButtons[uniqueKey] = button;

                const img = document.createElement("img");
                img.src = item.imageUrl;
                img.alt = item.name || "Item";

                const quantityInfo = document.createElement("span");
                quantityInfo.classList.add("quantity-info");
                quantityInfo.textContent = `1/${item.quantity} OC`;

                const countDisplay = document.createElement("span");
                countDisplay.classList.add("count-display");
                countDisplay.textContent = "x0";

                button.appendChild(img);
                button.appendChild(quantityInfo);
                button.appendChild(countDisplay);
                container.appendChild(button);

                button.addEventListener("click", (e) => {
                    if (e.button === 0) {
                        handleLeftClick(e, item, countDisplay);
                    }
                });

                button.addEventListener("contextmenu", (e) => {
                    if (e.button === 2) {
                        handleRightClick(e, item, countDisplay);
                    }
                });
            });

            sellersContainer.appendChild(sellerDiv);
        });

        calculateTotalValues();
    })
    .catch((error) => {
        console.error("Error fetching or processing data:", error);
    });

resetButton.addEventListener("click", resetAll);
searchInput.addEventListener("input", filterItems);
saveLocalBtn.addEventListener("click", saveToLocal);
loadLocalBtn.addEventListener("click", loadFromLocal);
// exportClipboardBtn.addEventListener("click", exportToClipboard);
// importClipboardBtn.addEventListener("click", importFromClipboard);

// Load data from local storage on page load
loadFromLocal(true);
