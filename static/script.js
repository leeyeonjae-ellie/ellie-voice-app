// script.js — Ellie voice interaction with animations

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const input = document.querySelector("input[name='user_input']");
  const output = document.querySelector(".response") || createOutputBox();

  function createOutputBox() {
    const box = document.createElement("div");
    box.className = "response";
    document.body.appendChild(box);
    return box;
  }

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
      output.innerHTML = "<p>Error: Could not connect to Ellie.</p>";
    } finally {
      input.disabled = false;
      input.value = "";
    }
  };
});
