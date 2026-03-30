// --- Global Elements & State ---
const mainScreen = document.getElementById('main-screen');
const settingsScreen = document.getElementById('settings-screen');
const slider = document.getElementById('speedSlider');
const speedInput = document.getElementById('speedInput');
const presetButtonsContainer = document.getElementById('preset-buttons');
const presetInputsContainer = document.getElementById('preset-inputs');
const currentHotkeyDisplay = document.getElementById('current-hotkey');
const masterToggle = document.getElementById('master-toggle');
const themeToggle = document.getElementById('theme-toggle');
const domainLabel = document.getElementById('domain-label');

let currentDomain = "global";
let config = { presets: [1.0, 1.5, 2.0, 2.5, 3.0], lightMode: false, hotkeys: { mod: 's', up: 'ArrowUp', down: 'ArrowDown' }, enabled: true };

// --- Initialization ---
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && !tabs[0].url.startsWith('chrome://')) {
        currentDomain = new URL(tabs[0].url).hostname;
        domainLabel.textContent = `Speed for ${currentDomain}`;
    } else {
        domainLabel.textContent = "Global Speed";
    }

    chrome.storage.local.get(['config', 'domainSpeeds'], (result) => {
        if (result.config) config = { ...config, ...result.config };
        if (config.lightMode) document.documentElement.setAttribute('data-theme', 'light');
        masterToggle.checked = config.enabled;
        themeToggle.checked = config.lightMode;
        
        let speeds = result.domainSpeeds || {};
        updateSpeedUI(speeds[currentDomain] || 1.0);
        renderPresets();
        populateSettings();
    });
});

// --- Speed Application Logic ---
function updateSpeedUI(speed) {
    let s = parseFloat(speed);
    if (isNaN(s) || s <= 0) s = 1.0;
    slider.value = s; 
    speedInput.value = s;
}

function setSpeed(speed) {
    let finalSpeed = parseFloat(speed);
    updateSpeedUI(finalSpeed);
    
    chrome.storage.local.get(['domainSpeeds'], (result) => {
        let speeds = result.domainSpeeds || {};
        speeds[currentDomain] = finalSpeed;
        chrome.storage.local.set({ domainSpeeds: speeds });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "FORCE_SPEED", speed: finalSpeed }).catch(() => {});
        }
    });
}

// --- Event Listeners ---
slider.addEventListener('input', (e) => setSpeed(e.target.value));
speedInput.addEventListener('change', (e) => setSpeed(e.target.value));

masterToggle.addEventListener('change', (e) => {
    config.enabled = e.target.checked;
    chrome.storage.local.set({ config: config });
});

// INSTANT Theme Toggle Logic
themeToggle.addEventListener('change', (e) => {
    config.lightMode = e.target.checked;
    if (config.lightMode) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    chrome.storage.local.set({ config: config });
});

document.getElementById('open-settings').onclick = () => { mainScreen.classList.add('hidden'); settingsScreen.classList.remove('hidden'); };
document.getElementById('close-settings').onclick = () => { settingsScreen.classList.add('hidden'); mainScreen.classList.remove('hidden'); };

// --- Settings & UI Generation ---
function renderPresets() {
    presetButtonsContainer.innerHTML = '';
    config.presets.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn'; btn.textContent = p + 'x';
        btn.onclick = () => setSpeed(p);
        presetButtonsContainer.appendChild(btn);
    });
}

function formatKey(key) { return key.replace('Arrow', ''); }

function populateSettings() {
    document.getElementById('hk-mod').value = config.hotkeys.mod;
    document.getElementById('hk-up').value = config.hotkeys.up;
    document.getElementById('hk-down').value = config.hotkeys.down;
    currentHotkeyDisplay.textContent = `Shift + ${config.hotkeys.mod.toUpperCase()} + ${formatKey(config.hotkeys.up)} / ${formatKey(config.hotkeys.down)}`;

    presetInputsContainer.innerHTML = '';
    config.presets.forEach((p) => {
        const inp = document.createElement('input');
        inp.type = 'text'; inp.className = 'settings-input'; inp.style.width = '35px'; inp.value = p;
        presetInputsContainer.appendChild(inp);
    });
}

document.getElementById('save-settings').onclick = () => {
    config.hotkeys.mod = document.getElementById('hk-mod').value.toLowerCase();
    config.hotkeys.up = document.getElementById('hk-up').value;
    config.hotkeys.down = document.getElementById('hk-down').value;
    
    const newPresets = [];
    document.querySelectorAll('#preset-inputs input').forEach(inp => newPresets.push(parseFloat(inp.value) || 1.0));
    config.presets = newPresets;

    chrome.storage.local.set({ config: config }, () => {
        populateSettings();
        renderPresets();
        document.getElementById('close-settings').click();
    });
};