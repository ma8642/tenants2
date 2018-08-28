module.exports = {
  "testURL": "http://localhost",
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "roots": [
    "frontend"
  ],
  "collectCoverage": true,
  "coverageReporters": [
    "lcov",
    "html"
  ],
  "coverageDirectory": "./coverage/jest/",
  "testRegex": "((\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "restoreMocks": true,
  "setupTestFrameworkScriptFile": "./frontend/lib/tests/setup.ts"
};
