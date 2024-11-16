let currentPage = 1;
const camerasPerPage = 9;
const cameraUrls = [
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_01_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_02_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_03_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_05_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_06_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_08_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_09_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_11_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_12_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_13_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_14_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_15_sub",
    "rtsp://admin:poipoi11@10.0.0.6:554/h264Preview_16_sub"
];

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
