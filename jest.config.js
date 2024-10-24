module.exports = {
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/tests/**/*.{js,jsx}"
  ],
  coverageReporters: ['text', 'lcov', 'json', 'html'],
  coverageDirectory: "coverage",

  testPathIgnorePatterns: [
    "/node_modules/",
    "/e2e/"
  ],
};
