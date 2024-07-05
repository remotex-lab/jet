module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [ '@swc/jest' ],
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!**/*.d.ts',
    ],
    testPathIgnorePatterns: [ '/lib/', '/node_modules/', '/dist/' ],
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@errors/(.*)$': '<rootDir>/src/errors/$1',
        '^@states/(.*)$': '<rootDir>/src/states/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@directives/(.*)$': '<rootDir>/src/directives/$1'
    },
};
