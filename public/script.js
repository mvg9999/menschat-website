document.getElementById("recordButton").addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleRecording)
    .catch((error) => console.error("MediaDevices error:", error));
});

function handleRecording(stream) {
  const mediaRecorder = new MediaRecorder(stream);
  let audioChunks = [];

  mediaRecorder.start();

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });

  mediaRecorder.addEventListener("stop", () => {
    const audioBlob = new Blob(audioChunks);
    playAudio(audioBlob);
    sendAudioToServer(audioBlob);
  });

  // Stop recording after 5 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 5000);
}

function playAudio(audioBlob) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function sendAudioToServer(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob);

  fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("transcribedText").textContent =
        data.transcribedText;
    })
    .catch((error) => console.error("Error:", error));
}
