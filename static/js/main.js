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
    const historyTableBody = document.getElementById("historyTableBody");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    const wpmDisplay = document.getElementById("wpmDisplay");
    const accuracyDisplay = document.getElementById("accuracyDisplay");
    const timeDisplay = document.getElementById("timeDisplay");

    // 設定定数
    const HISTORY_STORAGE_KEY = "typing_tutor_history";

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

    function escapeHtml(char) {
        if (char === "&") return "&amp;";
        if (char === "<") return "&lt;";
        if (char === ">") return "&gt;";
        if (char === '"') return "&quot;";
        if (char === "'") return "&#039;";
        return char;
    }

    // 2. 確定版テキスト描画関数
    function renderText() {
        const textDisplay = document.getElementById("textDisplay");
        if (!textDisplay || !targetText) return;

        let html = "";

        for (let i = 0; i < targetText.length; i++) {
            const char = targetText[i];

            // 状態に応じたクラス（correct / incorrect / current / pending）
            let className = "pending";
            if (i < currentIndex) {
                className = typedHistory[i] ? "correct" : "incorrect";
            } else if (i === currentIndex) {
                className = "current"; // 現在入力中の文字
            }

            if (char === "\n") {
                // 改行マーク（↵）にクラスを適用し、<br> は span の外に出す
                html += `<span class="${className} char-newline">↵</span><br>`;
            } else if (char === " ") {
                // スペース
                html += `<span class="${className} char-space">&nbsp;</span>`;
            } else {
                // 通常の文字
                html += `<span class="${className}">${escapeHtml(char)}</span>`;
            }
        }

        textDisplay.innerHTML = html;
    }

    // --- フォーカス制御関数 ---
    function focusInput() {
        if (hiddenInput) {
            hiddenInput.value = "";
            hiddenInput.focus();
        }
    }

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

    // --- 履歴テーブル描画 ---
    function renderHistory() {
        if (!historyTableBody) return;

        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");

            if (!Array.isArray(history) || history.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No practice history yet.</td></tr>';
                return;
            }

            let html = "";
            history.slice().reverse().forEach(item => {
                html += `
                    <tr>
                        <td>${item.date}</td>
                        <td>L${item.level} (${item.category})</td>
                        <td><strong>${item.wpm}</strong></td>
                        <td>${item.accuracy}</td>
                    </tr>
                `;
            });
            historyTableBody.innerHTML = html;
        } catch (e) {
            console.error("Failed to render history:", e);
            historyTableBody.innerHTML = '<tr><td colspan="4" class="no-data">Error loading history.</td></tr>';
        }
    }

    // --- スコア保存処理 ---
    function saveScoreToHistory(wpm, accuracy) {
        try {
            const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");

            const now = new Date();
            const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const newRecord = {
                date: dateStr,
                level: levelSelect ? levelSelect.value : "1",
                category: categorySelect ? categorySelect.value : "default",
                wpm: wpm || "0",
                accuracy: accuracy || "100.0%"
            };

            history.push(newRecord);

            if (history.length > 20) {
                history.shift();
            }

            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
            renderHistory();
        } catch (e) {
            console.error("Failed to save score to history:", e);
        }
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


     hiddenInput.addEventListener("keydown", async (e) => {
        // レッスン完了時に Enter キーで Next Lesson を開始
        if (isCompleted && e.key === "Enter") {
            e.preventDefault();
            loadText();
            return;
        }

        if (isCompleted || !targetText) return;

        // 1. Enterキーと1文字以外の特殊キー（Shift, Control, Alt等）は無視
        if (e.key.length !== 1 && e.key !== "Enter") return;

        // 2. ブラウザのデフォルト動作（Enterによるページスクロール等）を防止
        if (e.key === "Enter") {
            e.preventDefault();
        }

        // タイマースタート
        if (!startTime) {
            startTime = new Date();
            timerInterval = setInterval(updateStats, 200);
        }

        // 3. Enter キーの場合は API へ改行文字 "\n" として渡す
        const typedChar = (e.key === "Enter") ? "\n" : e.key;
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

                // 効果音再生
                if (!result.is_correct) {
                    errors++;
                    playErrorSound(); // ミス時の警告音
                } else {
                    playTypeSound();  // 正しい打鍵音
                }

                typedHistory[currentIndex] = result.is_correct;
                currentIndex = result.current_index;

                if (result.is_completed || currentIndex >= targetText.length) {
                    isCompleted = true;
                }

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

        const finalWpm = wpmDisplay ? wpmDisplay.innerText : "0";
        const finalAccuracy = accuracyDisplay ? accuracyDisplay.innerText : "100.0%";
        const finalTime = timeDisplay ? timeDisplay.innerText : "0s";

        const finalWpmElem = document.getElementById("finalWpm");
        const finalAccuracyElem = document.getElementById("finalAccuracy");
        const finalTimeElem = document.getElementById("finalTime");

        if (finalWpmElem) finalWpmElem.innerText = finalWpm;
        if (finalAccuracyElem) finalAccuracyElem.innerText = finalAccuracy;
        if (finalTimeElem) finalTimeElem.innerText = finalTime;

        if (resultModal) resultModal.classList.remove("hidden");

        updateKeyboardHighlight();

        // 履歴の保存＆更新
        saveScoreToHistory(finalWpm, finalAccuracy);
    }

    // --- イベントリスナー登録 ---
    if (typingContainer) typingContainer.addEventListener("click", focusInput);
    if (restartBtn) restartBtn.addEventListener("click", loadText);
    if (modalRestartBtn) modalRestartBtn.addEventListener("click", loadText);
    if (levelSelect) levelSelect.addEventListener("change", loadText);
    if (categorySelect) categorySelect.addEventListener("change", loadText);

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", () => {
            if (confirm("Clear all practice history?")) {
                localStorage.removeItem(HISTORY_STORAGE_KEY);
                renderHistory();
                focusInput();
            }
        });
    }

    // 初期化実行
    renderHistory();
    loadText();
});

// --- 効果音（Web Audio API）制御 ---
    let audioCtx = null;
    let isSoundEnabled = true;

    // AudioContext の初期化（ユーザー操作をトリガーにして生成）
    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    // 正解時のタイピング音（タイプライター / レトロクリック音）
    function playTypeSound() {
        if (!isSoundEnabled) return;
        initAudio();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // 短いビープ音（アタック感のある短い音）
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }

    // ミス時の警告音（低音エラーピープ）
    function playErrorSound() {
        if (!isSoundEnabled) return;
        initAudio();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // 低い鋸歯状波（エラー感のある低いブザー音）
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.setValueAtTime(120, audioCtx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    }

    // サウンドON/OFFトグルボタンのイベントハンドラ
    const soundToggle = document.getElementById("soundToggle");
    if (soundToggle) {
        soundToggle.addEventListener("click", () => {
            isSoundEnabled = !isSoundEnabled;
            soundToggle.innerText = isSoundEnabled ? "🔊 ON" : "🔇 OFF";
            focusInput();
        });
    }

    // --- キー入力制御のレスポンス処理部分に音再生を追加 ---
    // (打鍵判定レスポンスの if (response.ok) 内に以下を追加)
    /*
        if (result.is_correct) {
            playTypeSound();
        } else {
            playErrorSound();
        }
    */