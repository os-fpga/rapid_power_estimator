module.exports = {
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
  
  // Ensure this section is correctly configured for coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",  // Include JS/JSX files in src directory
    "!src/**/*.test.{js,jsx}", // Exclude test files from coverage
    "!src/**/index.{js,jsx}",  // Optionally exclude index files
  ],
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: "coverage",  // Ensure it is stored properly
};
