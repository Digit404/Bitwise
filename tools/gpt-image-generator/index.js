const refs = document.getElementById("refs");
const sizeSel = document.getElementById("sizeSel");
const bgSel = document.getElementById("bgSel");
const qualitySel = document.getElementById("qualitySel");
const downloadBtn = document.getElementById("downloadBtn");
const genBtn = document.getElementById("generateBtn");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");
const popupClose = document.getElementById("popup-close");
const popupText = document.getElementById("popup-text");
const popupIcon = document.getElementById("popup-icon");
const maskBtn = document.getElementById("maskBtn");
const maskInput = document.getElementById("maskInput");
const output = document.getElementById("output");

const maxSlots = 5;
const testing = false;
let slotCount = 0;

// --- helpers ---
const sneak = (w, f) => {
    w.style.backgroundImage = `url(${URL.createObjectURL(f)})`;
    w.classList.add("filled");
};
const clearSlot = (w, inp) => {
    w.style.backgroundImage = "";
    w.classList.remove("filled");
    inp.value = "";
};

// --- slots ---
function addSlot() {
    if (slotCount >= maxSlots) return;
    const w = document.createElement("div");
    w.className = "slot";
    const label = document.createElement("span");
    label.className = "slot-label";
    label.innerHTML = "Upload&nbsp;Image";
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    const x = document.createElement("button");
    x.className = "x-btn";
    x.textContent = "×";

    w.append(label, inp, x);
    refs.appendChild(w);
    slotCount++;

    inp.addEventListener("change", () => {
        if (!inp.files[0]) return;
        sneak(w, inp.files[0]);
        ensureFreeSlot();
        updateMaskVisibility();
    });
    x.addEventListener("click", (e) => {
        e.stopPropagation();
        clearSlot(w, inp);
        ensureFreeSlot(false);
        updateMaskVisibility();
    });

    ["dragenter", "dragover"].forEach((ev) =>
        w.addEventListener(ev, (e) => {
            e.preventDefault();
            w.classList.add("drag-over");
        })
    );
    ["dragleave", "drop"].forEach((ev) => w.addEventListener(ev, () => w.classList.remove("drag-over")));
    w.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            inp.files = e.dataTransfer.files;
            inp.dispatchEvent(new Event("change"));
        }
    });
}

function updateMaskVisibility() {
    const hasImage = [...refs.querySelectorAll(".slot.filled")].length > 0;
    maskBtn.style.display = hasImage ? "inline-flex" : "none";
    if (!hasImage) {
        maskInput.value = "";
        maskBtn.classList.remove("selected");
        maskBtn.style.background = "";
        maskBtn.textContent = "+ mask";
    }
}

function ensureFreeSlot(checkFilled = true) {
    const empties = [...refs.querySelectorAll(".slot")].filter((s) => !s.classList.contains("filled"));
    if (empties.length === 0 && slotCount < maxSlots) addSlot();
    if (!checkFilled && empties.length > 1) {
        empties.slice(1).forEach((s) => {
            refs.removeChild(s);
            slotCount--;
        });
    }
}

// Initialize dark mode
function initDarkMode() {
    const darkModeButton = document.createElement("button");
    darkModeButton.id = "dark-mode-button";
    darkModeButton.textContent = "light_mode";
    document.body.appendChild(darkModeButton);

    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (darkMode) {
        toggleDarkMode();
    }

    darkModeButton.addEventListener("click", toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const darkModeButton = document.getElementById("dark-mode-button");
    darkModeButton.textContent = document.body.classList.contains("dark") ? "dark_mode" : "light_mode";
}

// --- popup ---
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

// --- kick-off ---
addSlot();
initDarkMode();

// --- mask Preview ---
maskBtn.addEventListener("click", () => maskInput.click());
maskInput.addEventListener("change", (e) => {
    if (!e.target.files[0]) return;
    sneak(maskBtn, e.target.files[0]);
    maskBtn.textContent = "";
    maskBtn.classList.add("selected");
});
updateMaskVisibility();

// --- generate ---
genBtn.addEventListener("click", async () => {
    genBtn.disabled = true;
    genBtn.textContent = "Generating...";
    downloadBtn.style.display = "none";

    const api_key = document.getElementById("api-key").value.trim();
    if (!api_key) {
        showPopup("Need an API key.", "error");
        genBtn.disabled = false;
        genBtn.textContent = "Generate";
        return;
    }
    const prompt = document.getElementById("prompt").value.trim();
    if (!prompt) {
        showPopup("Need a prompt.", "error");
        genBtn.disabled = false;
        genBtn.textContent = "Generate";
        return;
    }

    output.innerHTML = '<span style="color:#aaa;">Loading…</span>';
    const fileInputs = [...refs.querySelectorAll('input[type="file"]')];
    const refFiles = fileInputs.map((i) => i.files[0]).filter(Boolean);
    const maskFile = maskInput.files[0] || null;
    const hasImages = refFiles.length > 0 || maskFile;

    try {
        let json;
        if (!testing) {
            if (!hasImages) {
                const body = {
                    model: "gpt-image-1",
                    prompt,
                    n: 1,
                    size: sizeSel.value,
                    output_format: "png",
                    background: bgSel.value,
                    quality: qualitySel.value,
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
                const fd = new FormData();
                fd.append("prompt", prompt);
                fd.append("model", "gpt-image-1");
                fd.append("n", "1");
                fd.append("size", sizeSel.value);
                fd.append("background", bgSel.value);
                fd.append("quality", qualitySel.value);
                fd.append("output_format", "png");
                refFiles.forEach((f) => fd.append("image[]", f));
                if (maskFile) fd.append("mask", maskFile);

                const res = await fetch("https://api.openai.com/v1/images/edits", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${api_key}` },
                    body: fd,
                });
                json = await res.json();
                if (!res.ok) throw new Error(json?.error?.message || "OpenAI error");
            }
            const b64 = json.data?.[0]?.b64_json;
            if (!b64) throw new Error("No image returned from API.");
            output.innerHTML = `<img src="data:image/png;base64,${b64}" />`;
        } else {
            output.innerHTML = `<img src="https://img.pokemondb.net/artwork/large/pikachu-hoenn-cap.jpg" />`;
        }

        downloadBtn.style.display = "block";
        downloadBtn.onclick = () => {
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
        genBtn.disabled = false;
        genBtn.textContent = "Generate";
    } catch (err) {
        console.error(err);
        output.innerHTML = "";
        showPopup(err.message, "error");
        genBtn.disabled = false;
        genBtn.textContent = "Generate";
    }
});

if (!localStorage.getItem("notWarnedApiKey")) {
    popup.style.display = "flex";
    localStorage.setItem("notWarnedApiKey", "1");
}
