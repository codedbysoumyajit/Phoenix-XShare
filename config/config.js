const config = {
  settings: {
    domain: "http://localhost:3000",
    mongoURI: "your mongodb uri from atlas or private srv",
    encryption: true,
    loginUser: "admin",
    loginPass: "paste your hashed password from https://bcrypt-generator.com/",
    port: 3000
  }
};

export default config;