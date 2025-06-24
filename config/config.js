const config = {
  settings: {
    domain: "http://localhost:3000 (domain must include protocol like http or https and port if have.)",
    mongoURI: "mongodb://user:password@host:port/database?options (get mongodb from atlas or host your own.)",
    encryption: true,
    loginUser: "admin (username can be set of your choice)",
    loginPass: "paste your hashed password here (get your hashed password from https://bcrypt-generator.com/)",
    port: 3000
  }
};

export default config;