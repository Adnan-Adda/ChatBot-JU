const express = require("express");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Mock /assess endpoint
app.post("/assess", (req, res) => {
  console.log("Received request to /assess with body:", req.body);

  // Simulate a realistic wrongness probability score (0 = very correct, 1 = very wrong)
  const result = Math.random() * 0.5;

  res.json({ result });
});

// Mock /assess endpoint
app.post("/feedback", (req, res) => {
  console.log("Received request to /feedback with body:", req.body);

  // Simulate a realistic wrongness probability score (0 = very correct, 1 = very wrong)
  const message = "Inserted feedback";

  res.json({ message });
});

app.listen(port, () => {
  console.log(`Mock Reality Check API running on http://localhost:${port}`);
});
