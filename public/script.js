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

function convertTextToSpeech(text) {
  const ttsData = new FormData();
  fetch("/api/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      voiceId: "XB0fDUnXU5powFXDhCwa",
      modelId: "eleven_multilingual_v2",
    }),
  })
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      console.log("ArrayBuffer size: ", arrayBuffer.byteLength); // Check the size
      /*
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "audio10000.mp3";
      link.click();
      URL.revokeObjectURL(link.href);*/
      playAudioBuffer(arrayBuffer);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/*
function playGeneratedAudio(audioUrl) {
  console.log("playing generated audio now");
  console.log("Generated Audio URL:", audioUrl);
  const audio = new Audio(audioUrl);
  audio.play();
}*/
function playAudioBuffer(arrayBuffer) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContext
    .decodeAudioData(arrayBuffer)
    .then((buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    })
    .catch((e) => {
      console.error("Error decoding audio data: ", e);
    });
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
      console.log("beginning TTS");
      convertTextToSpeech(data.transcribedText);
    })
    .catch((error) => console.error("Error:", error));
}
