const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const loggerMiddleware = require("./middleware/loggerMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const recordsRoutes = require("./routes/recordsRoutes");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

dotenv.config();

const app = express();


const swaggerDocument = YAML.load(
  "./src/docs/swagger.yaml"
);

// Enable CORS
app.use(cors());


// Parse JSON
app.use(express.json());


// Request Logger
app.use(loggerMiddleware);


// Routes
app.use("/", authRoutes);
app.use("/records", recordsRoutes);


// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Grace Mock API Running"
  });
});


// Error Middleware
app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);