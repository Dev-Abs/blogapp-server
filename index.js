// server setup
const express = require("express");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv").config();
const colors = require("colors");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware.js");
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const blogPricingMontlhy = new Map([
  [1, { priceInCents: 900, name: "Basic" }],
  [2, { priceInCents: 1900, name: "Standard" }],
  [3, { priceInCents: 2900, name: "Premium" }],
]);

const blogPricingYearly = new Map([
  [1, { priceInCents: 9000, name: "Basic" }],
  [2, { priceInCents: 19000, name: "Standard" }],
  [3, { priceInCents: 29000, name: "Premium" }],
]);

// Monthly subscription
app.post("/create-checkout-session", async (req, res) => {
  try {
    const plan = blogPricingMontlhy.get(req.body.plan);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
            },
            recurring: {
              interval: "month", // Monthly recurring
            },
            unit_amount: plan.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
    res.json({url: session.url});
  } catch (error) {
    console.error("Error in /create-checkout-session:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Yearly subscription
app.post("/create-checkout-session-yearly", async (req, res) => {
  try {
    const plan = blogPricingYearly.get(req.body.plan);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
            },
            recurring: {
              interval: "year", // Yearly recurring
            },
            unit_amount: plan.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error in /create-checkout-session-yearly:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// blogs and user routes setup

app.use("/api/blogs", require("./routes/blogRoutes.js"));
app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/", (req, res) => {
  res.send("API is running...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
