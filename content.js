// --- Core State ---
let currentDomain = window.location.hostname;
let targetSpeed = 1.0;
let config = { enabled: true, hotkeys: { mod: 's', up: 'ArrowUp', down: 'ArrowDown' } };

// --- 1. Glassmorphic HUD Overlay ---
function showHUD(speed) {
    if (!config.enabled) return;
    
    let hud = document.getElementById('speed-controller-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'speed-controller-hud';
        Object.assign(hud.style, {
            position: 'fixed', top: '20px', right: '20px', zIndex: '2147483647',
            background: 'rgba(25, 25, 25, 0.65)', color: '#00e5ff',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 24px',
            fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none',
            opacity: '0', transition: 'opacity 0.2s ease, transform 0.2s ease', transform: 'translateY(-10px)'
        });
        document.body.appendChild(hud);
    }
    
    hud.textContent = `${parseFloat(speed).toFixed(2)}x`;
    hud.style.opacity = '1';
    hud.style.transform = 'translateY(0)';
    
    clearTimeout(hud.hideTimeout);
    hud.hideTimeout = setTimeout(() => {
        hud.style.opacity = '0';
        hud.style.transform = 'translateY(-10px)';
    }, 1500);
}

// --- 2. Heartbeat Enforcer ---
function applySpeed() {
    if (!config.enabled) return;
    document.querySelectorAll('video').forEach(video => {
        if (video.playbackRate !== targetSpeed) {
            video.playbackRate = targetSpeed;
        }
    });
}
setInterval(applySpeed, 500);

// --- 3. Message Listeners & Initialization ---
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "FORCE_SPEED") {
        targetSpeed = parseFloat(message.speed);
        applySpeed();
        showHUD(targetSpeed);
    }
});

chrome.storage.local.get(['domainSpeeds', 'config'], (result) => {
    if (result.config) config = { ...config, ...result.config };
    if (result.domainSpeeds && result.domainSpeeds[currentDomain]) {
        targetSpeed = result.domainSpeeds[currentDomain];
    }
    applySpeed();
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.config) config = { ...config, ...changes.config.newValue };
});

// --- 4. Hotkey Listener Engine ---
let isModDown = false;

window.addEventListener('keydown', (e) => {
    if (!config.enabled) return;
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;

    if (e.key.toLowerCase() === config.hotkeys.mod.toLowerCase()) {
        isModDown = true;
    }

    if (e.shiftKey && isModDown) {
        if (e.key === config.hotkeys.up) {
            e.preventDefault(); e.stopImmediatePropagation();
            targetSpeed = Math.min(16, parseFloat((targetSpeed + 0.5).toFixed(1)));
            saveAndApplySpeed();
        } 
        else if (e.key === config.hotkeys.down) {
            e.preventDefault(); e.stopImmediatePropagation();
            targetSpeed = Math.max(0.1, parseFloat((targetSpeed - 0.5).toFixed(1)));
            saveAndApplySpeed();
        }
    }
}, true);

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === config.hotkeys.mod.toLowerCase()) isModDown = false;
}, true);

window.addEventListener('blur', () => { isModDown = false; });

// --- 5. State Persistence ---
function saveAndApplySpeed() {
    applySpeed();
    showHUD(targetSpeed);
    
    chrome.storage.local.get(['domainSpeeds'], (result) => {
        let speeds = result.domainSpeeds || {};
        speeds[currentDomain] = targetSpeed;
        chrome.storage.local.set({ domainSpeeds: speeds });
    });
}