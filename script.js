const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatDisplay = document.getElementById("chatDisplay");
const voiceBtn = document.getElementById("voiceBtn");
const imageInput = document.getElementById("imageInput");
const uploadImage = document.getElementById("uploadImage");
const toggleTheme = document.getElementById("toggleTheme");

let userFile = null;

// ✅ REPLACE with your valid Gemini API key
const API_KEY = 'AIzaSyB8_5uuRn4CkdMzfZtO6aFLSG_dyECSibA';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const appendMessage = (role, content) => {
  const message = document.createElement("div");
  message.classList.add("chat-message", role);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.innerHTML = content;

  message.appendChild(bubble);
  chatDisplay.appendChild(message);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
};

const appendTyping = () => {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.classList.add("chat-message", "bot");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble", "typing");
  bubble.innerHTML = "Typing";

  typing.appendChild(bubble);
  chatDisplay.appendChild(typing);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
};

const removeTyping = () => {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
};

const showImagePreview = () => {
  if (userFile) {
    const preview = `<img src="${userFile}" class="image-preview" />`;
    appendMessage("user", preview);
  }
};

const handleSend = async () => {
  const userText = chatInput.value.trim();
  if (!userText && !userFile) return;

  let content = userText ? marked.parse(userText) : "";
  if (userFile) content += `<img src="${userFile}" class="image-preview" />`;

  appendMessage("user", content);
  chatInput.value = "";

  appendTyping();

  const parts = [{ text: userText }];
  if (userFile) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: userFile.split(",")[1],
      },
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    removeTyping();
    appendMessage("bot", marked.parse(result));
  } catch (err) {
    console.error(err);
    removeTyping();
    appendMessage("bot", "<strong>Error:</strong> Could not get AI response.");
  }

  userFile = null;
};

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});

uploadImage.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file?.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    userFile = event.target.result;
    showImagePreview();
  };
  reader.readAsDataURL(file);
});

if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    chatInput.value = event.results[0][0].transcript;
  };
  recognition.onerror = (event) => alert("Voice Error: " + event.error);
  voiceBtn.addEventListener("click", () => recognition.start());
} else {
  voiceBtn.style.display = "none";
}

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
