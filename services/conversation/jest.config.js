/** @type {import('jest').Config} */
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/application/**/*.(t|j)s',
        'src/domain/**/*.(t|j)s',
        'src/interface/**/*.(t|j)s',
    ],
    coveragePathIgnorePatterns: [
        'src/application/ports/input/index.ts',
        'src/application/dtos/message.input.ts',
        'src/interface/controllers/',
        'src/interface/grpc/controllers/',
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
};
