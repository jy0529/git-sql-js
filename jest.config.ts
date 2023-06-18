/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
	testMatch: ['<rootDir>/**/__tests__/**/*.spec.ts'],
	testPathIgnorePatterns: ['/node_modules/'],
	moduleFileExtensions: [
		"ts",
		"js",
		"tsx"
	]
};
