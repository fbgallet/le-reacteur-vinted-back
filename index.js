require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
//mongoose.connect(process.env.MONGODB_URI + "vinted");

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const paymentRoutes = require("./routes/payment");
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

// Welcome Route
app.get("/", (req, res) => {
  try {
    res.status(200).json({
      message: "Welcome on the Vinted replica API by Fabrice Gallet 👋",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All other routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist ⛔" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started ✅");
});
