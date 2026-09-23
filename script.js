const todayDate = document.getElementById("todayDate");

function formatDateOnly(isoString) {
    const d = new Date(isoString);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}. ${m}. ${day}.`;
}

todayDate.textContent = formatDateOnly(new Date().toISOString());

const titleInput    = document.getElementById("titleInput");
const weatherSelect = document.getElementById("weatherSelect");
const emojiButtons = document.querySelectorAll(".emoji-btn");
const diaryText = document.getElementById("diaryText");
const saveBtn   = document.getElementById("saveBtn");
const formHint  = document.getElementById("formHint");
const newBtn = document.getElementById("newBtn");
const entryNav  = document.getElementById("entryNav");
const searchInput   = document.getElementById("searchInput");

let selectedEmoji = null;
let selectedLabel = null;
let currentEditId = null;

emojiButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        emojiButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedEmoji = btn.dataset.emoji;
        selectedLabel = btn.dataset.label;
    });
});

let entries = [];

try {
    const saved = localStorage.getItem("emotionDiaryEntriesV2");
    entries = saved ? JSON.parse(saved) : [];
} catch (e) {
    entries = [];
}

function saveEntriesToStorage() {
    try {
        localStorage.setItem("emotionDiaryEntriesV2", JSON.stringify(entries));
    } catch (e) {
    }
}

function renderNav() {
    entryNav.innerHTML = "";

    const query = searchInput.value.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const filtered = query ? sorted.filter(en => (en.title || "").toLowerCase().includes(query) || (en.text || "").toLowerCase().includes(query))
    : sorted;

    if (filtered.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-note";
        empty.textContent = entries.length === 0 ? "There's Nothing" : "Cannot find the result";
        entryNav.appendChild(empty);
        return;
    }

    filtered.forEach(entry => {
        const li = document.createElement("li");
        if (entry.id === currentEditId) li.classList.add("active");

        const mainPart = document.createElement("div");
        mainPart.className = "nav-main";

        const titleRow = document.createElement("div");
        titleRow.className = "nav-title-row";

        const emojiSpan = document.createElement("span");
        emojiSpan.className = "nav-emoji";
        emojiSpan.textContent = entry.emoji || "";

        const titleSpan = document.createElement("span");
        titleSpan.className = "nav-title";
        titleSpan.textContent = entry.title || "Untitled";

        titleRow.appendChild(emojiSpan);
        titleRow.appendChild(titleSpan);

        const previewSpan = document.createElement("span");
        previewSpan.className = "nav-preview";
        const dateText = formatDateOnly(entry.date);
        const snippet = (entry.text || "").replace(/\n/g, " ");
        previewSpan.innerHTML = `<span class="nav-date">${dateText}</span> ${snippet}`;

        mainPart.appendChild(titleRow);
        mainPart.appendChild(previewSpan);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "nav-delete";
        deleteBtn.textContent = "delete";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            entries = entries.filter(en => en.id !== entry.id);
            saveEntriesToStorage();
            if (currentEditId === entry.id) resetForm();
            renderNav();
        });

        li.addEventListener("click", () => loadEntry(entry.id));

        li.appendChild(mainPart);
        li.appendChild(deleteBtn);
        entryNav.appendChild(li);
    });
}

searchInput.addEventListener("input", renderNav);

function loadEntry(id) {
    const entry = entries.find(en => en.id === id);
    if (!entry) return;

    currenteditId = id;
    titleInput.value = entry.title || "";
    weatherSelect.value = entry.weather || "☀️";
    diaryText.value = entry.text || "";

    emojiButtons.forEach(b => b.classList.remove("selected"));
    const matchBtn = [...emojiButtons].find(b => b.dataset.emoji === entry.emoji);
    if (matchBtn) matchBtn.classList.add("selected");
    selectedEmoji = entry.emoji;
    selectedLabel = entry.label;

    formHint.textContent = "";
    renderNav();
}

function resetForm() {
    currentEditId = null;
    titleInput.value = "";
    weatherSelect.value ="☀️";
    diaryText.value = "";
    emojiButtons.forEach(b => b.classList.remove("selected"));
    selectedEmoji = null;
    selectedLabel = null;
    formHint.textContent = "";
}

newBtn.addEventListener("click", () => {
    resetForm();
    renderNav();
    titleInput.focus();
});

function saveEntry () {
    const text = diaryText.value.trim();

    if (!selectedEmoji) {
        formHint.textContent = "What's your feeling today";
        return;
    }
    if (!text) {
        formHint.textContent = "How was your day";
        return;
    }

    if (currentEditId) {
        const entry =entries.find(en => en.id === currentEditId);
        entry.title = titleInput.value.trim();
        entry,weather = weatherSelect.value;
        entry.emoji = selectedEmoji;
        entry.label = selectedLabel;
        entry.text = text;
    } else {
        currentEditId = Date.now().toString();
        entries.push({
            id: currentEditId,
            title: titleInput.value.trim(),
            weather: weatherSelect.value,
            emoji: selectedEmoji,
            label: selectedLabel,
            text: text,
            date: new Date().toISOString(),
        });
    }

    saveEntriesToStorage();
    formHint.textContent = "Saved";
    renderNav();
    resetForm();
}

saveBtn.addEventListener("click", saveEntry);

renderNav();
