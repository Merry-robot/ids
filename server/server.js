require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Routes
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to VATSIM OAuth Example</h1>
    <a href="https://auth.vatsim.net/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=full_name email vatsim_details country">
      Login with VATSIM
    </a>
  `);
});

// Callback route
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code is missing.");
  }

  try {
    // Exchange authorization code for an access token
    const tokenResponse = await axios.post("https://auth.vatsim.net/oauth/token", {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    });

    const { access_token } = tokenResponse.data;

    // Fetch user data with access token
    const userResponse = await axios.get("https://auth.vatsim.net/api/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = userResponse.data;

    // Display user data
    res.send(`
      <h1>User Information</h1>
      <p><strong>Full Name:</strong> ${userData.personal.name_full}</p>
      <p><strong>Email:</strong> ${userData.personal.email}</p>
      <p><strong>VATSIM ID:</strong> ${userData.cid}</p>
    `);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error during the authentication process.");
  }
});

app.use(express.static(path.join(__dirname, "public")));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
