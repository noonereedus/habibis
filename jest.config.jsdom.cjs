module.exports = {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.js$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-react"] }],
    },
};