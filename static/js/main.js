/**
 * Typing Tutor - Main JavaScript Module
 */

// DOM 要素の取得
const textDisplay = document.getElementById("textDisplay");
const hiddenInput = document.getElementById("hiddenInput");
const wpmDisplay = document.getElementById("wpmDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const timeDisplay = document.getElementById("timeDisplay");

const categorySelect = document.getElementById("categorySelect");
const chapterSelect = document.getElementById("chapterSelect");
const levelSelect = document.getElementById("levelSelect");
const modeSelect = document.getElementById("modeSelect");
const themeSelect = document.getElementById("themeSelect");

const soundToggle = document.getElementById("soundToggle");
const restartBtn = document.getElementById("restartBtn");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const startLessonBtn = document.getElementById("startLessonBtn");

const fingerNameDisplay = document.getElementById("fingerNameDisplay");
const historyTableBody = document.getElementById("historyTableBody");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const settingsModal = document.getElementById("settingsModal");
const resultModal = document.getElementById("resultModal");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalTime = document.getElementById("finalTime");
const modalRestartBtn = document.getElementById("modalRestartBtn");
const typingContainer = document.getElementById("typingContainer");

// アプリケーション状態変数
let targetText = "";
let currentIndex = 0;
let typedHistory = [];
let startTime = null;
let timerInterval = null;
let errorsCount = 0;
let totalTypedCount = 0;
let isCompleted = false;
let soundEnabled = true;

// Web Audio API 効果音
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playKeySound(type) {
    if (!soundEnabled) return;
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === "complete") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}

// Control UI Status
function updateControlState() {
    if (!categorySelect || !chapterSelect || !levelSelect) return;
    const category = categorySelect.value;

    if (category === "alice") {
        chapterSelect.disabled = false;
        levelSelect.disabled = true;
    } else {
        chapterSelect.disabled = true;
        levelSelect.disabled = false;
    }
}

async function updateChapterOptions(category) {
    if (!chapterSelect) return;

    if (category !== "alice") {
        chapterSelect.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`/api/chapters?category=${category}`);
        if (!response.ok) throw new Error("Failed to fetch chapters");

        const data = await response.json();
        chapterSelect.innerHTML = "";

        if (data.chapters && data.chapters.length > 0) {
            data.chapters.forEach(ch => {
                const option = document.createElement("option");
                option.value = ch;
                option.textContent = `Chapter ${ch}`;
                chapterSelect.appendChild(option);
            });
        } else {
            const option = document.createElement("option");
            option.value = "1";
            option.textContent = "Chapter 1";
            chapterSelect.appendChild(option);
        }
    } catch (error) {
        console.error("Error updating chapters:", error);
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadText() {
    if (!categorySelect) return;

    const category = categorySelect.value;
    const paramKey = (category === "alice") ? "chapter" : "level";
    const paramValue = (category === "alice")
        ? (chapterSelect && chapterSelect.value ? chapterSelect.value : "1")
        : (levelSelect && levelSelect.value ? levelSelect.value : "1");

    try {
        const response = await fetch(`/api/text?category=${category}&${paramKey}=${paramValue}`);
        if (!response.ok) throw new Error("Failed to fetch text");

        const data = await response.json();

        // クォートおよびダッシュ（— –）を標準入力可能な記号に自動変換・標準化
        targetText = (data.text || "The quick brown fox jumps over the lazy dog.")
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/[—–]/g, "-");

        currentIndex = 0;
        typedHistory = [];
        errorsCount = 0;
        totalTypedCount = 0;
        isCompleted = false;
        startTime = null;

        if (timerInterval) clearInterval(timerInterval);
        resetStatsDisplay();

        renderText();
        updateKeyboardHighlight();
        focusHiddenInput();
    } catch (error) {
        console.error("Text load error:", error);
        if (textDisplay) textDisplay.textContent = "Failed to load lesson text.";
    }
}

function renderText() {
    if (!textDisplay) return;

    let html = "";
    for (let i = 0; i < targetText.length; i++) {
        const char = targetText[i];
        let displayChar = escapeHtml(char);

        if (char === "\n") {
            displayChar = "↵<br>";
        }

        if (i < currentIndex) {
            const historyItem = typedHistory[i];
            const className = (historyItem && historyItem.isCorrect) ? "char-correct" : "char-incorrect";
            html += `<span class="${className}">${displayChar}</span>`;
        } else if (i === currentIndex) {
            html += `<span class="char-current">${displayChar}</span>`;
        } else {
            html += `<span class="char-pending">${displayChar}</span>`;
        }
    }

    textDisplay.innerHTML = html;

    // 現在の入力位置へスクロール追従
    const currentEl = textDisplay.querySelector(".char-current");
    if (currentEl && typingContainer) {
        currentEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function updateKeyboardHighlight() {
    document.querySelectorAll(".key").forEach(key => key.classList.remove("next-key"));

    if (currentIndex >= targetText.length) {
        if (fingerNameDisplay) fingerNameDisplay.textContent = "-[ Completed ]-";
        return;
    }

    const nextChar = targetText[currentIndex];
    let searchKey = nextChar.toLowerCase();

    if (nextChar === "\n") {
        searchKey = "enter";
    } else if (nextChar === " ") {
        searchKey = " ";
    } else if (nextChar === '"' || nextChar === "'") {
        searchKey = "'";
    }

    const targetKeyEl = Array.from(document.querySelectorAll(".key")).find(el => {
        const keyVal = el.getAttribute("data-key");
        if (keyVal) return keyVal.toLowerCase() === searchKey;
        if (searchKey === "enter" && el.classList.contains("key-enter")) return true;
        return false;
    });

    if (targetKeyEl) {
        targetKeyEl.classList.add("next-key");
        const finger = targetKeyEl.getAttribute("data-finger") || "Home Position";
        if (fingerNameDisplay) {
            fingerNameDisplay.textContent = `Next Key: '${nextChar === "\n" ? "Enter" : nextChar}' (${finger})`;
        }
    }
}

function updateStats() {
    if (!startTime) return;

    const currentTime = new Date();
    const timeSeconds = (currentTime - startTime) / 1000;

    if (timeDisplay) timeDisplay.textContent = `${Math.floor(timeSeconds)}s`;

    if (totalTypedCount > 0) {
        const accuracy = Math.max(0, ((totalTypedCount - errorsCount) / totalTypedCount) * 100);
        if (accuracyDisplay) accuracyDisplay.textContent = `${accuracy.toFixed(1)}%`;

        const wordsTyped = totalTypedCount / 5;
        const minutes = timeSeconds / 60;
        const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        if (wpmDisplay) wpmDisplay.textContent = wpm;
    }
}

function resetStatsDisplay() {
    if (wpmDisplay) wpmDisplay.textContent = "0";
    if (accuracyDisplay) accuracyDisplay.textContent = "100.0%";
    if (timeDisplay) timeDisplay.textContent = "0s";
}

function focusHiddenInput() {
    if (hiddenInput && settingsModal.classList.contains("hidden")) {
        hiddenInput.focus();
    }
}

// 打鍵入力ハンドリング
if (hiddenInput) {
    hiddenInput.addEventListener("keydown", async (e) => {
        if (isCompleted || currentIndex >= targetText.length) return;
        if (!settingsModal.classList.contains("hidden")) return; // モーダル表示中は打鍵無効

        if (["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock"].includes(e.key)) {
            return;
        }

        e.preventDefault();

        if (!startTime) {
            startTime = new Date();
            timerInterval = setInterval(updateStats, 500);
        }

        let typedChar = e.key;
        if (e.key === "Enter") {
            typedChar = "\n";
        }

        const expectedChar = targetText[currentIndex];
        const mode = modeSelect ? modeSelect.value : "strict";

        totalTypedCount++;

        if (typedChar === expectedChar) {
            typedHistory.push({ char: typedChar, isCorrect: true });
            currentIndex++;
            playKeySound("correct");
        } else {
            errorsCount++;
            playKeySound("error");

            if (mode === "strict") {
                renderText();
                updateStats();
                return;
            } else {
                typedHistory.push({ char: typedChar, isCorrect: false });
                currentIndex++;
            }
        }

        renderText();
        updateKeyboardHighlight();
        updateStats();

        if (currentIndex >= targetText.length) {
            completeLesson();
        }
    });
}

function completeLesson() {
    isCompleted = true;
    if (timerInterval) clearInterval(timerInterval);

    playKeySound("complete");

    const endTime = new Date();
    const timeSeconds = (endTime - startTime) / 1000;
    const accuracy = Math.max(0, ((totalTypedCount - errorsCount) / totalTypedCount) * 100);
    const wpm = timeSeconds > 0 ? Math.round((totalTypedCount / 5) / (timeSeconds / 60)) : 0;

    if (finalWpm) finalWpm.textContent = wpm;
    if (finalAccuracy) finalAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    if (finalTime) finalTime.textContent = `${Math.floor(timeSeconds)}s`;

    saveHistory({
        date: new Date().toLocaleDateString(),
        level: categorySelect.value === "alice" ? `Alice Ch.${chapterSelect.value}` : `Level ${levelSelect.value}`,
        wpm: wpm,
        accuracy: `${accuracy.toFixed(1)}%`
    });

    renderHistory();
    if (resultModal) resultModal.classList.remove("hidden");
}

function getHistory() {
    const history = localStorage.getItem("typing_history");
    return history ? JSON.parse(history) : [];
}

function saveHistory(item) {
    const history = getHistory();
    history.unshift(item);
    localStorage.setItem("typing_history", JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
    if (!historyTableBody) return;
    const history = getHistory();

    if (history.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No practice history yet.</td></tr>';
        return;
    }

    historyTableBody.innerHTML = history.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.level}</td>
            <td>${item.wpm}</td>
            <td>${item.accuracy}</td>
        </tr>
    `).join("");
}

// イベント設定
document.addEventListener("DOMContentLoaded", async () => {
    updateControlState();
    if (categorySelect) {
        await updateChapterOptions(categorySelect.value);
    }
    renderHistory();
});

if (categorySelect) {
    categorySelect.addEventListener("change", async () => {
        updateControlState();
        await updateChapterOptions(categorySelect.value);
    });
}

if (openSettingsBtn) {
    openSettingsBtn.addEventListener("click", () => {
        if (settingsModal) settingsModal.classList.remove("hidden");
    });
}

if (startLessonBtn) {
    startLessonBtn.addEventListener("click", async () => {
        if (settingsModal) settingsModal.classList.add("hidden");
        await loadText();
    });
}

if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        loadText();
    });
}

if (modalRestartBtn) {
    modalRestartBtn.addEventListener("click", () => {
        if (resultModal) resultModal.classList.add("hidden");
        if (settingsModal) settingsModal.classList.remove("hidden");
    });
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        localStorage.removeItem("typing_history");
        renderHistory();
    });
}

if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? "🔊 ON" : "🔇 OFF";
        focusHiddenInput();
    });
}

if (themeSelect) {
    themeSelect.addEventListener("change", () => {
        if (themeSelect.value === "system7") {
            document.documentElement.setAttribute("data-theme", "system7");
            document.body.setAttribute("data-theme", "system7");
        } else {
            document.documentElement.removeAttribute("data-theme");
            document.body.removeAttribute("data-theme");
        }
        focusHiddenInput();
    });
}

if (typingContainer) {
    typingContainer.addEventListener("click", focusHiddenInput);
}