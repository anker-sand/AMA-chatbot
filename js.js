// ---- Hardcoded knowledge base ----
const responses = [
  {
    keywords: ["hello", "hi", "hey"],
    reply: "Hey! I can tell you a bit about myself.",
    suggestions: ["hobbies", "job"],
  },
  {
    keywords: ["hobby", "hobbies", "free time"],
    reply: "In my free time I like playing guitar.",
    suggestions: ["job"],
  },
  {
    keywords: ["job", "work", "career", "occupation", "student"],
    reply: "Im a web developer student ",
    suggestions: ["hobbies"],
  },
];

const fallback = {
  reply: "I don't have an answer for that yet.",
  suggestions: ["hobbies", "job"],
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---- Matching logic ----
function getBotReply(userText) {
  const text = userText.toLowerCase();
  for (const item of responses) {
    const matched = item.keywords.some((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      return regex.test(text);
    });
    if (matched) return item;
  }
  return fallback;
}

// ---- UI logic ----
const chat = document.getElementById("chat");
const input = document.getElementById("input");

function sendMessage() {
  const question = input.value.trim();
  if (!question) return;

  addMessage("You", question, "user");
  input.value = "";

  setTimeout(() => {
    const { reply, suggestions } = getBotReply(question);
    addMessage("Bot", reply, "bot", suggestions);
  }, 400);
}

function addMessage(sender, text, cls, suggestions) {
  const div = document.createElement("div");
  div.className = "msg";

  let body = escapeHtml(text);
  if (suggestions && suggestions.length) {
    const pills = suggestions
      .map((s) => `<span class="keyword">${escapeHtml(s)}</span>`)
      .join(", ");
    body += `<div class="suggestions">Ask about ${pills}</div>`;
  }

  div.innerHTML = `<span class="${cls}">${escapeHtml(sender)}:</span> ${body}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
