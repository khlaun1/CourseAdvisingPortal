module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  //moduleNameMapper: {
  //'^@/components/(.*)$': '<rootDir>/src/components/$1',
  //'^@/utils/(.*)$': '<rootDir>/src/utils/$1'
  //},
  //setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testTimeout: 30000,
  //collectCoverage: true,
  //coverageDirectory: 'coverage',
  //coverageReporters: ['html', 'text', 'lcov'],
  roots: ["C:/Tis_mah_folder/SimpleCrudApp/__test__"],
  /*coveragePathIgnorePatterns: [
      '/node_modules/',
      '/test/', // Exclude test files from coverage
      '/config/', // Exclude configuration files or folders
      '/public/' // Exclude static assets if applicable
    ],*/
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // }
};
