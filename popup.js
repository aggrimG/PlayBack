const slider = document.getElementById('speedSlider');
const speedInput = document.getElementById('speedInput');
function updateSpeed(newSpeed) {
    let speed = parseFloat(newSpeed);
    if (isNaN(speed) || speed <= 0) speed = 1.0;
    
    slider.value = speed;
    speedInput.value = speed;
    chrome.storage.local.set({ savedSpeed: speed });
}

chrome.storage.local.get(['savedSpeed'], (result) => {
    if (result.savedSpeed) {
        updateSpeed(result.savedSpeed);
    }
});
slider.addEventListener('input', (e) => {
    updateSpeed(e.target.value);
});
speedInput.addEventListener('change', (e) => {
    updateSpeed(e.target.value);
});