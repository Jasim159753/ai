let recognition;
let conversationMode = false;
let conversationContext = {};

function startSpeechRecognition() {
  recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.onstart = function () {
    console.log("Speech recognition started...");
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    processVoiceInput(transcript);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = function () {
    console.log("Speech recognition ended.");
    // Start listening again after it ends
    recognition.start();
  };

  recognition.start();
}

function stopSpeechRecognition() {
  recognition.stop();
  console.log("Speech recognition stopped.");
}

function processVoiceInput(transcript) {
  const resultDiv = document.getElementById("result");

  // Check if the transcript contains the trigger word "Jarvis"
  if (transcript.includes("jarvis")) {
    if (conversationMode) {
      // Continue the conversation
      continueConversation(transcript);
    } else {
      // Enter conversation mode
      startConversation();
    }
  } else if (conversationMode) {
    // Continue the conversation
    continueConversation(transcript);
  } else {
    // Perform predefined commands
    const commands = {
      "open google": openGoogle,
      "tell me a joke": tellJoke,
      "what is your name": tellName,
      "how are you": tellMood,
      "who created you": tellCreator,
      "start conversation": startConversation,
      "where am i": whereAmI,
      "tell me a fun fact": tellFunFact,
      "who is the idiot in the room": whoIsTheIdiot,
      // Add more commands as needed
    };

    // Check if the transcript matches any command
    let matchedCommand = false;
    for (const command in commands) {
      if (transcript.includes(command)) {
        commands[command]();
        matchedCommand = true;
        break;
      }
    }

    // If no command matched, perform a Google search
    if (!matchedCommand) {
      resultDiv.innerText = `Searching Google for: "${transcript}"`;
      googleSearch(transcript);
    }
  }
}

function whoIsTheIdiot() {
  // Get the name from the input box
  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();

  // Display the result based on the provided name
  const resultDiv = document.getElementById("result");
  if (name) {
    const speechText = `${name} is an idiot in the room!`;
    resultDiv.innerText = speechText;
    speak(speechText);
  } else {
    const speechText = "Please enter a name in the input box.";
    resultDiv.innerText = speechText;
    speak(speechText);
  }
}

function startConversation() {
  conversationMode = true;
  conversationContext = {};
  const resultDiv = document.getElementById("result");
  resultDiv.innerText = "Hello! How can I assist you today?";
}

function continueConversation(transcript) {
  const resultDiv = document.getElementById("result");

  // Check for specific queries and update context
  if (transcript.includes("your name")) {
    conversationContext.nameQuery = true;
    resultDiv.innerText = "My name is Jarvis AI. How can I help you?";
  } else if (
    conversationContext.nameQuery &&
    transcript.includes("change name")
  ) {
    conversationContext.nameChangeQuery = true;
    resultDiv.innerText = "Sure, what would you like to change my name to?";
  } else if (conversationContext.nameChangeQuery) {
    // Update the AI's name and reset context
    conversationContext.nameChangeQuery = false;
    const newName = transcript.trim();
    resultDiv.innerText = `My name is now ${newName}. How can I assist you further?`;
  } else {
    // Default response if no specific context is triggered
    resultDiv.innerText =
      "I'm here to assist you. Feel free to ask any questions.";
  }
}

function openGoogle() {
  const resultDiv = document.getElementById("result");
  resultDiv.innerText = "Opening Google...";
  window.open("https://www.google.com", "_blank");
}

function tellJoke() {
  fetch("txt/jokes.txt")
    .then((response) => response.text())
    .then((data) => {
      const jokes = data.split("\n");
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      const resultDiv = document.getElementById("result");
      resultDiv.innerText = `Joke: ${randomJoke}`;
      speak(randomJoke);
    })
    .catch((error) => console.error("Error reading jokes.txt:", error));
}

function tellName() {
  fetch("txt/creator.txt")
    .then((response) => response.text())
    .then((creatorName) => {
      const resultDiv = document.getElementById("result");
      resultDiv.innerText = `My creator is ${creatorName.trim()}.`;
      speak(`My creator is ${creatorName.trim()}.`);
    })
    .catch((error) => console.error("Error reading creator.txt:", error));
}

function tellMood() {
  fetch("txt/mood.txt")
    .then((response) => response.text())
    .then((mood) => {
      const resultDiv = document.getElementById("result");
      resultDiv.innerText = `Mood: ${mood.trim()}`;
      speak(`Mood: ${mood.trim()}`);
    })
    .catch((error) => console.error("Error reading mood.txt:", error));
}

function tellCreator() {
  const resultDiv = document.getElementById("result");
  resultDiv.innerText = "I was created by Jasim.";
  speak("I was created by Jasim.");
}

function googleSearch(query) {
  // Perform a Google search and open the results in a new tab
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}`;
  window.open(googleSearchUrl, "_blank");
}
function whereAmI() {
  const resultDiv = document.getElementById("result");

  // Get user's location using geolocation
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      resultDiv.innerText = `Your current location is: Latitude ${latitude}, Longitude ${longitude}`;
    },
    (error) => {
      console.error("Error getting geolocation:", error);
      resultDiv.innerText =
        "Sorry, I couldn't retrieve your location at the moment.";
    }
  );
}

function tellFunFact() {
  fetch("txt/fun_facts.txt")
    .then((response) => response.text())
    .then((data) => {
      const funFacts = data.split("\n");
      const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
      const resultDiv = document.getElementById("result");
      resultDiv.innerText = `Fun Fact: ${randomFact}`;
      speak(randomFact);
    })
    .catch((error) => console.error("Error reading fun_facts.txt:", error));
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);

  // Set the pitch to 2
  utterance.pitch = 2;

  // Find the voice with the name "Google US English Male"
  const voices = window.speechSynthesis.getVoices();
  const googleMaleVoice = voices.find(
    (voice) => voice.name === "Microsoft Zira Desktop"
  );

  // Set the voice
  if (googleMaleVoice) {
    utterance.voice = googleMaleVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Trigger speech recognition when the page loads
startSpeechRecognition();
