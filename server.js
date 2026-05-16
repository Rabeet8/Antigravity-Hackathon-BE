const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NER Service running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/ner/health`);
});
