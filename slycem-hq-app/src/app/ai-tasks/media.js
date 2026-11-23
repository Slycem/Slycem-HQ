function waitForMedia(element, event, start) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(fail, 15000);
    function cleanup() {
      clearTimeout(timer);
      element.removeEventListener(event, done);
      element.removeEventListener("error", fail);
    }
    function done() { cleanup(); resolve(); }
    function fail() { cleanup(); reject(new Error("The browser could not read this media file.")); }
    element.addEventListener(event, done);
    element.addEventListener("error", fail);
    start();
  });
}

function jpegFrame(element, width, height) {
  const scale = Math.min(1, 1024 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(element, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78).split(",")[1];
}

export async function preparePictures(files) {
  const units = files.reduce((total, file) => total + (file.type.startsWith("video/") ? 4 : 1), 0);
  if (units > 8) throw new Error("Attach up to eight pictures and video frames combined.");
  const pictures = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      if (file.type.startsWith("image/")) {
        const image = new Image();
        await waitForMedia(image, "load", () => { image.src = url; });
        pictures.push({ label: file.name, jpeg: jpegFrame(image, image.naturalWidth, image.naturalHeight) });
      } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.muted = true;
        await waitForMedia(video, "loadeddata", () => { video.src = url; });
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          throw new Error("Choose a video with a readable duration.");
        }
        for (const point of [0.1, 0.35, 0.65, 0.9]) {
          const seconds = video.duration * point;
          await waitForMedia(video, "seeked", () => { video.currentTime = seconds; });
          pictures.push({
            label: file.name + " (" + seconds.toFixed(2) + "s, sampled video frame)",
            jpeg: jpegFrame(video, video.videoWidth, video.videoHeight),
          });
        }
      } else {
        throw new Error("Choose a picture or video in a format your browser can read.");
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return pictures;
}

