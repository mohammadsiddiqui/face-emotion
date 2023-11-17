const video = document.getElementById("video");
const containerEL = document.getElementById("app-container");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  // faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

const getVideoDimensions = () => {
  return { width: video.clientWidth, height: video.clientHeight };
};

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  containerEL.append(canvas);
  faceapi.matchDimensions(canvas, getVideoDimensions());

  setInterval(() => {
    startDetection(canvas);
  }, 200);

  startDetection(canvas);
});

async function startDetection(canvas) {
  const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
  if (!detections) return;

  const resizedDetections = faceapi.resizeResults(detections, getVideoDimensions());
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resizedDetections);
  faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  updateExpressionTexts(detections.expressions);
}

const emotionEL = document.getElementById("emotions");
function updateExpressionTexts(expressions) {
  const htmlDivs = [];

  const getPercentage = (value) => {
    if (typeof value !== "number") return (0).toFixed(2);
    return (value * 100).toFixed(2);
  };

  for (const [key, value] of Object.entries(expressions)) {
    htmlDivs.push(`<div>${key} : ${getPercentage(value)}%</div>`);
  }
  emotionEL.innerHTML = htmlDivs.join("");
}
