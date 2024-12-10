module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.js$": ["babel-jest", { presets: ["@babel/preset-env"] }],
    },
    testPathIgnorePatterns: ["<rootDir>/frontend/src/"],
};
