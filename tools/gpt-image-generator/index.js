const referenceContainer = document.getElementById("refs");
const sizeSelector = document.getElementById("sizeSel");
const bgSelector = document.getElementById("bgSel");
const qualitySelector = document.getElementById("qualitySel");
const downloadButton = document.getElementById("downloadBtn");
const generateButton = document.getElementById("generateBtn");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");
const popupClose = document.getElementById("popup-close");
const popupText = document.getElementById("popup-text");
const popupIcon = document.getElementById("popup-icon");
const maskButton = document.getElementById("maskBtn");
const maskInput = document.getElementById("maskInput");
const output = document.getElementById("output");

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
    button.className = "x-btn";
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

    output.innerHTML = '<span style="color:#aaa;">Loading…</span>';
    const fileInputs = [...referenceContainer.querySelectorAll('input[type="file"]')];
    const referenceImages = fileInputs.map((i) => i.files[0]).filter(Boolean);
    const maskFile = maskInput.files[0] || null;
    const hasImages = referenceImages.length > 0 || maskFile;

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
                    size: sizeSelector.value,
                    output_format: "png",
                    background: bgSelector.value,
                    quality: qualitySelector.value,
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
                formData.append("size", sizeSelector.value);
                formData.append("background", bgSelector.value);
                formData.append("quality", qualitySelector.value);
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
            output.innerHTML = `<img src="https://img.pokemondb.net/artwork/large/pikachu-hoenn-cap.jpg" />`;
        }

        downloadButton.style.display = "block";
        downloadButton.onclick = () => {
            const img = output.querySelector("img");
            if (!img) return;
            const url = img.src;
            const a = document.createElement("a");
            a.href = url;
            a.download = "gpt-image.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        generateButton.disabled = false;
        generateButton.textContent = "Generate";

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
