import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const answers = [
  {
    keywords: ["hello", "hi", "hey"],
    answer: "Hey! I can tell you a bit about myself.",
    suggestions: ["hobbies", "job"],
  },
  {
    keywords: ["hobby", "hobbies", "free time"],
    answer: "In my free time I like playing guitar.",
    suggestions: ["job"],
  },
  {
    keywords: ["job", "work", "career", "occupation", "student"],
    answer: "I'm a web developer student.",
    suggestions: ["hobbies"],
  },
];

const fallback = {
  answer: "I don't have an answer for that yet.",
  suggestions: ["hobbies", "job"],
};

function sanitizeQuestion(input) {
  return input
    .split("")
    .filter((char) => char.charCodeAt(0) > 31 && char.charCodeAt(0) !== 127)
    .join("");
}

function findAnswer(question) {
  const normalizedQuestion = question.toLowerCase();

  for (const answerGroup of answers) {
    const hasMatch = answerGroup.keywords.some((keyword) =>
      normalizedQuestion.includes(keyword)
    );

    if (hasMatch) {
      return { answer: answerGroup.answer, suggestions: answerGroup.suggestions };
    }
  }

  return fallback;
}

const messages = [];

app.get("/", (request, response) => {
  response.render("index", { messages, error: "" });
});

app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question;
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";

  if (!question) {
    error = "Write a question before sending.";
  } else if (question.length > 280) {
    error = "The question can be at most 280 characters.";
  } else {
    messages.push({ type: "question", text: question });
    const found = findAnswer(question);
    messages.push({ type: "answer", text: found.answer, suggestions: found.suggestions });
  }

  response.render("index", { messages, error });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
