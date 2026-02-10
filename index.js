const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");


dotenv.config();
const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

function error(res, code, message) {
  return res.status(code).json({
    is_success: false,
    message
  });
}



function fibonacci(n) {
  const res = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
}

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1)
      return error(res, 400, "Exactly one key is required");

    const key = keys[0];
    const value = body[key];

    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0)
          return error(res, 400, "Invalid fibonacci input");
        data = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value))
          return error(res, 400, "Prime expects array");
        data = value.filter(v => Number.isInteger(v) && isPrime(v));
        break;

      case "lcm":
        if (!Array.isArray(value) || value.some(v => !Number.isInteger(v)))
          return error(res, 400, "LCM expects integer array");
        data = lcm(value);
        break;

      case "hcf":
        if (!Array.isArray(value) || value.some(v => !Number.isInteger(v)))
          return error(res, 400, "HCF expects integer array");
        data = hcf(value);
        break;

      case "AI":
        if (typeof value !== "string")
          return error(res, 400, "AI expects string");

        const aiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: value }] }]
          }
        );

        data =
          aiRes.data.candidates[0].content.parts[0].text
            .split(/\s+/)[0]
            .replace(/[^\w]/g, "");

        break;

      default:
        return error(res, 400, "Invalid key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    return error(res, 500, "Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
