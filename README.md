# Auto Speed Controller

A sleek, lightweight browser extension that automatically forces all web videos to play at your preferred speed.

## Features
* **Universal Speed Control:** Automatically detects and applies your chosen speed to any HTML5 video (`<video>` tag) on any website.
* **Dynamic Loading:** Uses event delegation to catch and speed up videos that load dynamically *after* the page is already open.
* **Persistent Memory:** Remembers your chosen speed across all tabs and browsing sessions using the browser's Storage API.

## How to Install (Developer Mode)
Since this extension is not currently on the Chrome Web Store, you can easily install it locally:

1. **Download the code:** Clone this repository or download it as a ZIP file and extract it.
2. **Open Extensions Page:** Open your Chromium-based browser (Chrome, Edge, Brave) and navigate to `chrome://extensions/` (or `edge://extensions/`).
3. **Enable Developer Mode:** Toggle the "Developer mode" switch in the top right corner.
4. **Load the Extension:** Click the **Load unpacked** button in the top left and select the folder where you extracted this repository.
5. **Pin it:** Click the puzzle piece icon in your browser bar and pin the "Auto Speed Controller" for easy access!

## Built With
* JavaScript (Content Scripts, Storage API)
* HTML5
* CSS3 (Custom range slider styling)

## Usage
Simply click the extension icon in your browser bar, adjust the slider to your desired playback speed, and watch your videos instantly update. If you have a video already playing when you install the extension, just refresh the page once for the script to hook in!