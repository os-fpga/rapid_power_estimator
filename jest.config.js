module.exports = {
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",  
    "tests/**/*.{js,jsx}",  // including the tests folder so it covers front end tests coverage
    "!src/**/*.test.{js,jsx}", 
    "!src/**/index.{js,jsx}",  
  ],
  coverageReporters: ['text', 'lcov'],  
  coverageDirectory: "coverage",  
};
