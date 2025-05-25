// script.js — Ellie voice interaction with animations and speech input

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const input = document.querySelector("input[name='user_input']");
  const output = document.querySelector(".response") || createOutputBox();
  const micBtn = document.getElementById("mic");

  function createOutputBox() {
    const box = document.createElement("div");
    box.className = "response";
    document.body.appendChild(box);
    return box;
  }

  // 🎤 Speech recognition setup
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    micBtn.addEventListener("click", () => {
      recognition.start();
      micBtn.textContent = "🎙 Listening...";
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      form.dispatchEvent(new Event("submit"));
      micBtn.textContent = "🎤 Talk";
    };

    recognition.onerror = () => {
      micBtn.textContent = "🎤 Talk";
      alert("🎧 Could not recognize your voice. Try again.");
    };
  } else {
    micBtn.disabled = true;
    micBtn.textContent = "Mic not supported";
  }

  // 📤 Form submission
  form.onsubmit = async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    output.innerHTML = `<p><strong>Me:</strong> ${message}</p><p>Thinking...</p>`;
    input.disabled = true;

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ user_input: message })
      });

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newResponse = doc.querySelector(".response");

      output.innerHTML = newResponse?.innerHTML || "<p>Something went wrong.</p>";
    } catch (error) {
      output.innerHTML = "<p>문제가 발생했습니다.</p>";
    } finally {
      input.disabled = false;
      input.value = "";
    }
  };
});
