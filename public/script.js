document.getElementById("recordButton").addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(handleRecording)
    .catch((error) => console.error("MediaDevices error:", error));
});

function handleRecording(stream) {
  console.log("Handling recording"); // Add this to check
  const options = { mimeType: "audio/webm" }; // Use a supported format
  const mediaRecorder = new MediaRecorder(stream, options);
  let audioChunks = [];

  mediaRecorder.start();
  console.log("MediaRecorder started"); // Add this to check
  mediaRecorder.addEventListener("dataavailable", (event) => {
    console.log("Data available"); // Add this to check if data is being pushed
    audioChunks.push(event.data);
  });

  mediaRecorder.addEventListener("stop", () => {
    console.log("Recorder stopped"); // Add this to check if it's reaching here
    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
    console.log(
      "audioBlob created",
      `size: ${audioBlob.size}`,
      `type: ${audioBlob.type}`,
    );
    playAudio(audioBlob);
    sendAudioToServer(audioBlob);
  });

  // Stop recording after 5 seconds
  setTimeout(() => {
    mediaRecorder.stop();
  }, 2000);
}

function playAudio(audioBlob) {
  console.log("playing audio");
  console.log(audioBlob.type);
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
