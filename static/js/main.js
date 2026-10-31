document.addEventListener("DOMContentLoaded", () => {
    // DOM要素
    const textDisplay = document.getElementById("textDisplay");
    const hiddenInput = document.getElementById("hiddenInput");
    const typingContainer = document.getElementById("typingContainer");
    const levelSelect = document.getElementById("levelSelect");
    const categorySelect = document.getElementById("categorySelect");
    const modeSelect = document.getElementById("modeSelect");
    const themeSelect = document.getElementById("themeSelect");
    const restartBtn = document.getElementById("restartBtn");
    const modalRestartBtn = document.getElementById("modalRestartBtn");
    const resultModal = document.getElementById("resultModal");
    const fingerNameDisplay = document.getElementById("fingerNameDisplay");

    const wpmDisplay = document.getElementById("wpmDisplay");
    const accuracyDisplay = document.getElementById("accuracyDisplay");
    const timeDisplay = document.getElementById("timeDisplay");

    // 指の名称マッピング
    const FINGER_NAMES = {
        "left-pinky": "Left Pinky (左小指)",
        "left-ring": "Left Ring (左薬指)",
        "left-middle": "Left Middle (左中指)",
        "left-index": "Left Index (左人差し指)",
        "right-index": "Right Index (右人差し指)",
        "right-middle": "Right Middle (右中指)",
        "right-ring": "Right Ring (右薬指)",
        "right-pinky": "Right Pinky (右小指)",
        "thumb": "Thumb (親指)"
    };

    // アプリケーション状態
    let targetText = "";
    let currentIndex = 0;
    let totalTyped = 0;
    let errors = 0;
    let startTime = null;
    let timerInterval = null;
    let isCompleted = false;
    let typedHistory = [];

    // --- テーマ初期設定 ---
    const savedTheme = localStorage.getItem("typing_tutor_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeSelect) {
        themeSelect.value = savedTheme;
        themeSelect.addEventListener("change", (e) => {
            const selectedTheme = e.target.value;
            document.documentElement.setAttribute("data-theme", selectedTheme);
            localStorage.setItem("typing_tutor_theme", selectedTheme);
            focusInput();
        });
    }

    // --- 課題テキスト取得 (GET /api/text) ---
    async function loadText() {
        const level = levelSelect.value;
        const category = categorySelect.value;

        try {
            const response = await fetch(`/api/text?level=${level}&category=${category}`);
            const data = await response.json();

            if (response.ok) {
                targetText = data.text;
                resetState();
            } else {
                textDisplay.innerText = "Error loading text.";
            }
        } catch (error) {
            console.error("Failed to fetch text:", error);
            textDisplay.innerText = "Server error.";
        }
    }

    // --- 状態リセット ---
    function resetState() {
        currentIndex = 0;
        totalTyped = 0;
        errors = 0;
        startTime = null;
        isCompleted = false;
        typedHistory = new Array(targetText.length).fill(null);

        clearInterval(timerInterval);
        wpmDisplay.innerText = "0";
        accuracyDisplay.innerText = "100.0%";
        timeDisplay.innerText = "0s";
        resultModal.classList.add("hidden");

        renderText();
        updateKeyboardHighlight();
        focusInput();
    }

    // --- テキスト描画描画更新 ---
    function renderText() {
        let html = "";
        for (let i = 0; i < targetText.length; i++) {
            const char = targetText[i] === " " ? "&nbsp;" : targetText[i];

            if (i < currentIndex) {
                const statusClass = typedHistory[i] ? "char-correct" : "char-incorrect";
                html += `<span class="${statusClass}">${char}</span>`;
            } else if (i === currentIndex) {
                html += `<span class="char-current">${char}</span>`;
            } else {
                html += `<span class="char-untyped">${char}</span>`;
            }
        }
        textDisplay.innerHTML = html;
    }

    // --- オンスクリーンキーボードのハイライト＆指ガイド更新 ---
    function updateKeyboardHighlight() {
        document.querySelectorAll(".key.next-key").forEach(el => {
            el.classList.remove("next-key");
        });

        if (isCompleted || currentIndex >= targetText.length) {
            if (fingerNameDisplay) fingerNameDisplay.innerText = "Lesson Completed!";
            return;
        }

        const nextChar = targetText[currentIndex].toLowerCase();

        let keyElement = null;
        const allKeys = document.querySelectorAll(".key[data-key]");
        allKeys.forEach(key => {
            if (key.getAttribute("data-key") === nextChar) {
                keyElement = key;
            }
        });

        if (keyElement) {
            keyElement.classList.add("next-key");
            const finger = keyElement.getAttribute("data-finger");
            if (fingerNameDisplay) {
                fingerNameDisplay.innerText = FINGER_NAMES[finger] || "Home Position";
            }
        } else {
            if (fingerNameDisplay) fingerNameDisplay.innerText = "-";
        }
    }

    // --- キー入力制御 ---
    hiddenInput.addEventListener("keydown", async (e) => {
        // レッスン完了時に Enter キーで Next Lesson を開始
        if (isCompleted && e.key === "Enter") {
            e.preventDefault();
            loadText();
            return;
        }

        if (isCompleted || !targetText) return;

        // 特殊キー（Shift, Control等）は無視
        if (e.key.length !== 1) return;

        // タイマースタート
        if (!startTime) {
            startTime = new Date();
            timerInterval = setInterval(updateStats, 200);
        }

        const typedChar = e.key;
        const mode = modeSelect.value;

        // 打鍵判定 API (POST /api/evaluate)
        try {
            const response = await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target_text: targetText,
                    current_index: currentIndex,
                    typed_char: typedChar,
                    mode: mode
                })
            });

            const result = await response.json();

            if (response.ok) {
                totalTyped++;
                if (!result.is_correct) errors++;

                typedHistory[currentIndex] = result.is_correct;
                currentIndex = result.current_index;
                isCompleted = result.is_completed;

                renderText();
                updateKeyboardHighlight();
                await updateStats();

                if (isCompleted) {
                    finishLesson();
                }
            }
        } catch (error) {
            console.error("Evaluation API error:", error);
        }
    });

    // --- スコア計算更新 (POST /api/calculate) ---
    async function updateStats() {
        if (!startTime) return;

        const timeElapsed = (new Date() - startTime) / 1000;
        timeDisplay.innerText = `${Math.floor(timeElapsed)}s`;

        try {
            const response = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    total_typed: totalTyped,
                    errors: errors,
                    time_seconds: timeElapsed
                })
            });

            const data = await response.json();
            if (response.ok) {
                wpmDisplay.innerText = data.wpm;
                accuracyDisplay.innerText = `${data.accuracy}%`;
            }
        } catch (error) {
            console.error("Calculation API error:", error);
        }
    }

    // --- レッスン完了処理 ---
    function finishLesson() {
        clearInterval(timerInterval);
        document.getElementById("finalWpm").innerText = wpmDisplay.innerText;
        document.getElementById("finalAccuracy").innerText = accuracyDisplay.innerText;
        document.getElementById("finalTime").innerText = timeDisplay.innerText;
        resultModal.classList.remove("hidden");
        updateKeyboardHighlight();
    }

    // --- フォーカス制御 ---
    function focusInput() {
        hiddenInput.value = "";
        hiddenInput.focus();
    }

    typingContainer.addEventListener("click", focusInput);
    restartBtn.addEventListener("click", loadText);
    modalRestartBtn.addEventListener("click", loadText);
    levelSelect.addEventListener("change", loadText);
    categorySelect.addEventListener("change", loadText);

    // 初期起動
    loadText();
});