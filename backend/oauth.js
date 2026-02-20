const axios = require("axios");

let oauthToken = null;
let tokenExpire = 0;

async function getOAuthToken() {
  if (oauthToken && Date.now() < tokenExpire) {
    return oauthToken;
  }

  const response = await axios.post(
    "https://138.122.67.122/oauth/token",
    {
      grant_type: "password",
      client_id: process.env.ASTERISK_CLIENT_ID,
      client_secret: process.env.ASTERISK_CLIENT_SECRET,
      username: process.env.ASTERISK_USER,
      password: process.env.ASTERISK_PASS,
      scope: ""
    }
  );

  oauthToken = response.data.access_token;
  tokenExpire = Date.now() + (response.data.expires_in - 60) * 1000;

  return oauthToken;
}

module.exports = { getOAuthToken };
