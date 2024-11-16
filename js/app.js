const dotenv = require('dotenv');
dotenv.config();

// Define global variables
let currentPage = 1;
const camerasPerPage = 9;

// Function to construct RTSP URLs dynamically
function generateRTSPURL(cameraNumber) {
    return `rtsp://${process.env.REOLINK_USERNAME}:${process.env.REOLINK_PASSWORD}@${process.env.REOLINK_IP}:554/h264Preview_${cameraNumber}_sub`;
}

// Generate RTSP URLs for all cameras
const cameraUrls = [
    generateRTSPURL("01"),
    generateRTSPURL("02"),
    generateRTSPURL("03"),
    generateRTSPURL("05"),
    generateRTSPURL("06"),
    generateRTSPURL("08"),
    generateRTSPURL("09"),
    generateRTSPURL("11"),
    generateRTSPURL("12"),
    generateRTSPURL("13"),
    generateRTSPURL("14"),
    generateRTSPURL("15"),
    generateRTSPURL("16")
];

// Example of displaying the current page cameras
function displayCameras() {
    const startIndex = (currentPage - 1) * camerasPerPage;
    const endIndex = startIndex + camerasPerPage;
    const camerasToDisplay = cameraUrls.slice(startIndex, endIndex);

    console.log(`Cameras on Page ${currentPage}:`, camerasToDisplay);
}

// Example usage
displayCameras();


let isFullScreen = false;
let selectedCameraIndex = 0;

function startStream(cameraId, rtspUrl) {
    const player = tizen.avplay;
    player.open(rtspUrl);
    player.setDisplayRect(
        document.getElementById(cameraId).offsetLeft,
        document.getElementById(cameraId).offsetTop,
        document.getElementById(cameraId).offsetWidth,
        document.getElementById(cameraId).offsetHeight
    );
    player.prepare();
    player.play();
}

function initializeStreams() {
    const startIndex = (currentPage - 1) * camerasPerPage;
    const endIndex = startIndex + camerasPerPage;
    tizen.avplay.stop();
    for (let i = startIndex; i < endIndex && i < cameraUrls.length; i++) {
        const cameraId = "camera" + (i - startIndex + 1);
        startStream(cameraId, cameraUrls[i]);
    }
}

function toggleFullScreen(cameraId, rtspUrl) {
    const player = tizen.avplay;
    if (isFullScreen) {
        initializeStreams();
        isFullScreen = false;
    } else {
        player.open(rtspUrl);
        player.setDisplayRect(0, 0, 1920, 1080); // Full-screen dimensions
        player.prepare();
        player.play();
        isFullScreen = true;
    }
}

function navigateGrid(keyCode) {
    if (isFullScreen) {
        if (keyCode === 10009) { // Back key on remote
            tizen.avplay.stop();
            initializeStreams();
            isFullScreen = false;
        }
        return;
    }

    if (keyCode === 37) { // Left arrow
        selectedCameraIndex = (selectedCameraIndex > 0) ? selectedCameraIndex - 1 : camerasPerPage - 1;
    } else if (keyCode === 39) { // Right arrow
        selectedCameraIndex = (selectedCameraIndex + 1) % camerasPerPage;
    } else if (keyCode === 38) { // Up arrow
        selectedCameraIndex = (selectedCameraIndex - 3 + camerasPerPage) % camerasPerPage;
    } else if (keyCode === 40) { // Down arrow
        selectedCameraIndex = (selectedCameraIndex + 3) % camerasPerPage;
    } else if (keyCode === 13) { // Enter key
        const rtspUrl = cameraUrls[(currentPage - 1) * camerasPerPage + selectedCameraIndex];
        toggleFullScreen("camera" + (selectedCameraIndex + 1), rtspUrl);
    }
}

window.onload = initializeStreams;
document.addEventListener("keydown", function(event) {
    navigateGrid(event.keyCode);
});
