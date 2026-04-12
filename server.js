require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================
// ✅ CORS CONFIG (FINAL)
// ==========================
const allowedOrigins = [
"http://localhost:5173",
"https://multi-tenant-saas-pi.vercel.app",
];

app.use(
cors({
origin: function (origin, callback) {
// Allow requests with no origin (Postman, mobile apps)
if (!origin) return callback(null, true);

```
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  } else {
    return callback(new Error("Not allowed by CORS"));
  }
},
methods: ["GET", "POST", "PUT", "DELETE"],
credentials: true,
```

})
);

// Handle preflight requests
app.options(
"*",
cors({
origin: allowedOrigins,
credentials: true,
})
);

// ==========================
// ✅ MIDDLEWARE
// ==========================
app.use(express.json());

// ==========================
// ✅ ROUTES
// ==========================

// Health check
app.get("/", (req, res) => {
res.send("Server running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", protectedRoutes);

// ==========================
// ✅ ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
if (res.headersSent) {
return next(err);
}
console.error(err);
res.status(500).json({ message: err.message || "Internal server error" });
});

// ==========================
// ✅ START SERVER
// ==========================
async function start() {
try {
await connectDB();

```
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
```

} catch (err) {
console.error("❌ Failed to start server:", err.message);
process.exit(1);
}
}

start();
