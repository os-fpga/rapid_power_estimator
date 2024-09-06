module.exports = {
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",  // Including all JS/JSX files in src (including tests folder which have front-end tests)
    "!src/**/index.{js,jsx}",  // Excluding index files
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: "coverage",
};
