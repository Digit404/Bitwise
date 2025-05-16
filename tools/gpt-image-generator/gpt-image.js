const referenceContainer = document.getElementById("reference-container");
const sizeSelector = document.getElementById("size-select");
const bgSelector = document.getElementById("bg-select");
const qualitySelector = document.getElementById("quality-select");
const downloadButton = document.getElementById("download-button");
const generateButton = document.getElementById("generate-button");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");
const popupClose = document.getElementById("popup-close");
const popupText = document.getElementById("popup-text");
const popupIcon = document.getElementById("popup-icon");
const maskButton = document.getElementById("mask-button");
const maskInput = document.getElementById("mask-input");
const output = document.getElementById("output");
const historySection = document.getElementById("history-section");
const historyContainer = document.getElementById("history");
const historyTitle = document.getElementById("history-title");

const maxSlots = 5;
const testing = false;
let slotCount = 0;

// slot management
const setBackgroundImage = (slot, image) => {
    slot.style.backgroundImage = `url(${URL.createObjectURL(image)})`;
    slot.classList.add("filled");
};

const clearSlot = (slot, inputElement) => {
    slot.style.backgroundImage = "";
    slot.classList.remove("filled");
    inputElement.value = "";
};

function addSlot() {
    if (slotCount >= maxSlots) return;
    const slot = document.createElement("div");
    slot.className = "slot";
    const label = document.createElement("span");
    label.className = "slot-label";
    label.innerHTML = "Upload&nbsp;Image";
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = "image/*";
    const button = document.createElement("button");
    button.className = "x-button";
    button.innerText = "close";

    slot.append(label, inputElement, button);
    referenceContainer.appendChild(slot);
    slotCount++;

    inputElement.addEventListener("change", () => {
        if (!inputElement.files[0]) return;
        setBackgroundImage(slot, inputElement.files[0]);
        ensureFreeSlot();
        updateMaskVisibility();
    });

    button.addEventListener("click", (e) => {
        e.stopPropagation();
        clearSlot(slot, inputElement);
        ensureFreeSlot(false);
        updateMaskVisibility();
    });

    ["dragenter", "dragover"].forEach((eventString) =>
        slot.addEventListener(eventString, (e) => {
            e.preventDefault();
            slot.classList.add("drag-over");
        })
    );
    ["dragleave", "drop"].forEach((eventString) => slot.addEventListener(eventString, () => slot.classList.remove("drag-over")));
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            inputElement.files = e.dataTransfer.files;
            inputElement.dispatchEvent(new Event("change"));
        }
    });
}

// shows mask button if any image is uploaded
function updateMaskVisibility() {
    const hasImage = [...referenceContainer.querySelectorAll(".slot.filled")].length > 0;
    maskButton.style.display = hasImage ? "inline-flex" : "none";
    if (!hasImage) {
        maskInput.value = "";
        maskButton.classList.remove("selected");
        maskButton.style.background = "";
        maskButton.textContent = "+ mask";
    }
}

// make sure there's at least one empty slot, up to maxSlots
function ensureFreeSlot(checkFilled = true) {
    const emptySlots = [...referenceContainer.querySelectorAll(".slot")].filter((slot) => !slot.classList.contains("filled"));
    if (emptySlots.length === 0 && slotCount < maxSlots) addSlot();
    if (!checkFilled && emptySlots.length > 1) {
        emptySlots.slice(1).forEach((slot) => {
            referenceContainer.removeChild(slot);
            slotCount--;
        });
    }
}

// popup management
function showPopup(html, type = "info") {
    popup.style.display = "flex";
    if (type === "error") {
        popupContent.className = "error";
        popupIcon.innerText = "⚠️";
        popupIcon.style.display = "inline-block";
        popupClose.innerText = "Close";
    } else if (type === "info") {
        popupContent.className = "info";
        popupIcon.innerText = "ℹ️";
        popupIcon.style.display = "inline-block";
        popupClose.innerText = "Okay, got it";
    } else {
        popupContent.className = "";
    }
    popupText.innerHTML = html;
}
function hidePopup() {
    popup.style.display = "none";
}
document.getElementById("popup-close").onclick = hidePopup;

function setImageSettings(prompt, size, bg, quality) {
    document.getElementById("prompt").value = prompt;
    sizeSelector.value = size;
    bgSelector.value = bg;
    qualitySelector.value = quality;
}

function downloadImage(url) {
    const a = document.createElement("a");
    a.href = url;
    a.download = "gpt-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function addHistoryItem(imageUrl, prompt, size, bg, quality) {
    historySection.hidden = false;
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    const historyImage = document.createElement("img");
    historyImage.src = imageUrl;
    historyImage.alt = "Generated image";
    historyItem.dataset.prompt = prompt;
    historyItem.dataset.size = size;
    historyItem.dataset.bg = bg;
    historyItem.dataset.quality = quality;
    historyItem.dataset.imageUrl = historyImage.src;

    historyItem.appendChild(historyImage);
    historyContainer.appendChild(historyItem);

    historyItem.addEventListener("click", () => {
        setImageSettings(historyItem.dataset.prompt, historyItem.dataset.size, historyItem.dataset.bg, historyItem.dataset.quality);
        output.innerHTML = `<img src="${imageUrl}" />`;
    });
}

historyTitle.addEventListener("click", () => {
    historyContainer.classList.toggle("hidden");
    historyTitle.classList.toggle("expanded");
});

addSlot();

// mask preview
maskButton.addEventListener("click", () => maskInput.click());
maskInput.addEventListener("change", (e) => {
    if (!e.target.files[0]) return;
    setBackgroundImage(maskButton, e.target.files[0]);
    maskButton.textContent = "";
    maskButton.classList.add("selected");
});
updateMaskVisibility();

// generate
generateButton.addEventListener("click", async () => {
    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
    downloadButton.style.display = "none";

    // throw errors
    const api_key = document.getElementById("api-key").value.trim();
    if (!api_key) {
        showPopup("Need an API key.", "error");
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        return;
    }

    const prompt = document.getElementById("prompt").value.trim();
    if (!prompt) {
        showPopup("Need a prompt.", "error");
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        return;
    }

    // disable clicking on history while generating
    historySection.style.pointerEvents = "none";
    historySection.classList.add("disabled");

    output.innerHTML = '<span style="color:#aaa;">Loading…</span>';
    const fileInputs = [...referenceContainer.querySelectorAll('input[type="file"]')];
    const referenceImages = fileInputs.map((i) => i.files[0]).filter(Boolean);
    const maskFile = maskInput.files[0] || null;
    const hasImages = referenceImages.length > 0 || maskFile;

    const size = sizeSelector.value;
    const bg = bgSelector.value;
    const quality = qualitySelector.value;

    try {
        let json;
        if (!testing) {
            // main API call
            // if no images, use the generation endpoint, otherwise use the edit endpoint
            if (!hasImages) {
                const body = {
                    model: "gpt-image-1",
                    prompt,
                    n: 1,
                    size,
                    output_format: "png",
                    background: bg,
                    quality,
                };
                const res = await fetch("https://api.openai.com/v1/images/generations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${api_key}`,
                    },
                    body: JSON.stringify(body),
                });
                json = await res.json();
                if (!res.ok) throw new Error(json?.error?.message || "OpenAI error");
            } else {
                const formData = new FormData();
                formData.append("prompt", prompt);
                formData.append("model", "gpt-image-1");
                formData.append("n", "1");
                formData.append("size", size);
                formData.append("background", bg);
                formData.append("quality", quality);
                formData.append("output_format", "png");
                referenceImages.forEach((f) => formData.append("image[]", f));
                if (maskFile) formData.append("mask", maskFile);

                const response = await fetch("https://api.openai.com/v1/images/edits", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${api_key}` },
                    body: formData,
                });
                json = await response.json();
                if (!response.ok) throw new Error(json?.error?.message || "OpenAI error");
            }
            const b64 = json.data?.[0]?.b64_json;
            if (!b64) throw new Error("No image returned from API.");
            output.innerHTML = `<img src="data:image/png;base64,${b64}" />`;
        } else {
            // wait for 2 seconds
            await new Promise((resolve) => setTimeout(resolve, 2000));
            output.innerHTML = `<img src="https://img.pokemondb.net/artwork/large/pikachu-hoenn-cap.jpg" />`;
        }

        downloadButton.style.display = "block";
        downloadButton.onclick = () => {
            const img = output.querySelector("img");
            if (!img) return;
            const url = img.src;
            downloadImage(url);
        };

        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        const imageUrl = output.querySelector("img").src;

        addHistoryItem(imageUrl, prompt, size, bg, quality);

        // make history clickable again
        historySection.style.pointerEvents = "auto";
        historySection.classList.remove("disabled");

        // play a sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch("/res/sound/ping.wav")
            .then((res) => res.arrayBuffer())
            .then((buf) => audioContext.decodeAudioData(buf))
            .then((decoded) => {
                const src = audioContext.createBufferSource();
                src.buffer = decoded;
                src.playbackRate.value = 3.0;
                src.connect(audioContext.destination);
                src.start(0);
            })
            .catch((e) => {
                console.error("Failed to play sound:", e);
            });
    } catch (err) {
        console.error(err);
        output.innerHTML = "";
        showPopup(err.message, "error");
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
    }
});

if (!localStorage.getItem("notWarnedApiKey")) {
    popup.style.display = "flex";
    localStorage.setItem("notWarnedApiKey", "1");
}
