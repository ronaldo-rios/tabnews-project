const nextJest = require("next/jest");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.development" });
// The Jest environment is set to "test" by default, so we need to set it to "development"
process.env.NODE_ENV = "development";

const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

module.exports = jestConfig;
