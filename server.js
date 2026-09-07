import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const answers = [
  {
    category: "greeting",
    keywords: ["hello", "hi", "hey"],
    answer: "Hey! I can tell you a bit about myself.",
    suggestions: ["hobbies", "job"],
  },
  {
    category: "hobbies",
    keywords: ["hobby", "hobbies", "free time"],
    answer: "In my free time I like playing guitar.",
    suggestions: ["job"],
  },
  {
    category: "job",
    keywords: ["job", "work", "career", "occupation", "student"],
    answer: "I'm a web developer student.",
    suggestions: ["hobbies"],
  },
];

const fallback = {
  answer: "I don't have an answer for that yet.",
  suggestions: ["hobbies", "job"],
};

const topicStats = {
  greeting: 0,
  hobbies: 0,
  job: 0,
};

function sanitizeQuestion(input) {
  return input
    .split("")
    .filter((char) => char.charCodeAt(0) > 31 && char.charCodeAt(0) !== 127)
    .join("");
}

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword)
  );

  return matches.length;
}

function findBestAnswer(question) {
  const normalizedQuestion = question.toLowerCase();
  let bestScore = 0;
  let bestAnswer = fallback.answer;
  let bestCategory = "";
  let bestSuggestions = fallback.suggestions;

  for (const answerGroup of answers) {
    const score = countMatches(answerGroup.keywords, normalizedQuestion);

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = answerGroup.answer;
      bestCategory = answerGroup.category;
      bestSuggestions = answerGroup.suggestions;
    }
  }

  return {
    answer: bestAnswer,
    category: bestCategory,
    suggestions: bestSuggestions,
  };
}

const messages = [];

app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
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

    const result = findBestAnswer(question);
    messages.push({ type: "answer", text: result.answer, suggestions: result.suggestions });

    if (result.category) {
      topicStats[result.category] = topicStats[result.category] + 1;
    }
  }

  response.render("index", { messages, error, topicStats });
});

app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
