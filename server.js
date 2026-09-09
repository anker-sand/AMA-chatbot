import express from "express";

const app = express();
const port = 3000;

// Serverer statiske filer (CSS, billeder) fra public/
app.use(express.static("public"));
// Læser formulardata fra POST-requests ind i request.body
app.use(express.urlencoded({ extended: true }));
// Fortæller Express, at vi bruger EJS til at rendere HTML
app.set("view engine", "ejs");

// Array med alle botens svarregler: nøgleord, svaret og forslag til andre emner
const answers = [
  {
    category: "hilsen",
    keywords: ["hej", "goddag", "halløj"],
    answer: "Hej! Jeg kan fortælle lidt om mig selv.",
    suggestions: ["fritid", "job"],
  },
  {
    category: "fritid",
    keywords: ["fritid", "fritiden", "hobby", "hobbyer"],
    answer: "I min fritid kan jeg godt lide at spille guitar.",
    suggestions: ["job"],
  },
  {
    category: "job",
    keywords: ["job", "arbejde", "karriere", "studerende"],
    answer: "Jeg er webudvikler-studerende.",
    suggestions: ["fritid"],
  },
];

// Svaret vi bruger, når ingen regler matcher spørgsmålet
const fallback = {
  answer: "Det har jeg ikke et svar på endnu.",
  suggestions: ["fritid", "job"],
};

// Tæller hvor mange gange hver kategori er blevet spurgt om
const topicStats = {
  hilsen: 0,
  fritid: 0,
  job: 0,
};

// Fjerner usynlige kontroltegn fra brugerens input
function sanitizeQuestion(input) {
  return input
    .split("")
    .filter((char) => char.charCodeAt(0) > 31 && char.charCodeAt(0) !== 127)
    .join("");
}

// Tæller hvor mange af de givne nøgleord der findes i spørgsmålet. 

function countMatches(keywords, normalizedQuestion) {
  const matches = keywords.filter((keyword) =>
    normalizedQuestion.includes(keyword)
  );

  return matches.length;
}

// Finder alle regler i answers, der har mindst ét matchende nøgleord
function findMatchingAnswers(question) {
  const normalizedQuestion = question.toLowerCase();
  const matches = answers.filter(
    (answerGroup) => countMatches(answerGroup.keywords, normalizedQuestion) > 0
  );

  // Ingen match -> brug standardsvaret i stedet
  return matches.length > 0 ? matches : [fallback];
}

// Samtalehistorik: hver besked er { type: "question" | "answer", text, suggestions }
const messages = [];

app.get("/", (request, response) => {
  response.render("index", { messages, error: "", topicStats });
});

app.post("/ask", (request, response) => {
  const rawQuestion = request.body.question;
  const question = sanitizeQuestion(rawQuestion).trim();
  let error = "";

  if (!question) {
    error = "Skriv et spørgsmål, før du sender.";
  } else if (question.length > 280) {
    error = "Spørgsmålet må højst være 280 tegn.";
  } else {
    messages.push({ type: "question", text: question });

    // Ét spørgsmål kan matche flere emner, så vi svarer på hvert af dem
    const results = findMatchingAnswers(question);
    for (const result of results) {
      messages.push({ type: "answer", text: result.answer, suggestions: result.suggestions });

      // Kun tæl statistik for rigtige matches, ikke standardsvaret
      if (result.category) {
        topicStats[result.category] = topicStats[result.category] + 1;
      }
    }
  }

  response.render("index", { messages, error, topicStats });
});

// Tømmer samtalehistorikken og sender brugeren tilbage til forsiden
app.post("/clear-messages", (request, response) => {
  messages.length = 0;
  response.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
