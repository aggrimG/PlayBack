let targetSpeed = 1.0;
function updateAllVideos() {
    document.querySelectorAll('video').forEach(video => {
        video.playbackRate = targetSpeed;
    });
}
chrome.storage.local.get(['savedSpeed'], (result) => {
    if (result.savedSpeed) {
        targetSpeed = parseFloat(result.savedSpeed);
        updateAllVideos();
    }
});
chrome.storage.onChanged.addListener((changes) => {
    if (changes.savedSpeed) {
        targetSpeed = parseFloat(changes.savedSpeed.newValue);
        updateAllVideos();
    }
});

document.addEventListener('play', (event) => {
    if (event.target.tagName === 'VIDEO') {
        event.target.playbackRate = targetSpeed;
    }
}, true);