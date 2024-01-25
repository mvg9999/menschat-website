const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const app = express();
const port = 3000;

// Middleware for handling multipart/form-data
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json()); // Enable JSON parsing
app.use(express.static("public")); // To serve static files

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    console.log("Received file type:", req.file.mimetype);
    const audioFile = req.file;
    const formData = new FormData();
    formData.append("file", audioFile.buffer, {
      filename: audioFile.originalname,
      contentType: audioFile.mimetype,
      knownLength: audioFile.size,
    });
    console.log("Received audio file:", audioFile);
    formData.append("model", "whisper-1");
    formData.append("response_format", "text");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY3}`,
        },
      },
    );
    console.log("Transcription response:", response.data);
    const transcribedText = response.data;
    res.json({ transcribedText: transcribedText });
    console.log(transcribedText);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error with OpenAI API response:", error.response.data);
      res
        .status(500)
        .send(
          "Error transcribing audio: " + JSON.stringify(error.response.data),
        );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error with OpenAI API request:", error.request);
      res.status(500).send("No response received from OpenAI API");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request to OpenAI API:", error.message);
      res.status(500).send("Error setting up request to OpenAI API");
    }
  }
});

app.post("/api/text-to-speech", async (req, res) => {
  try {
    console.log("App.js called text-to-speech");
    console.log(req.body);
    const text = req.body.text;
    const modelId = req.body.modelId;
    const voiceId = req.body.voiceId;
    console.log(voiceId);
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId,
      {
        model_id: modelId,
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: "true",
        },
      },
      {
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": `${process.env.ELEVEN_LABS_API_KEY1}`, // Replace with your actual API key
        },
        responseType: "arraybuffer",
      },
    );
    //console.log("The response from elevenlabs is:", response.data);
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Error with ElevenLabs API:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Status Code:", error.response.status);
      console.error("Response Body:", error.response.data);
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      res.status(500).send("No response received from ElevenLabs API");
    } else {
      // Something happened in setting up the request
      console.error("Error message:", error.message);
      res.status(500).send("Error setting up request to ElevenLabs API");
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
