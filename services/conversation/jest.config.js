/** @type {import('jest').Config} */
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/application/**/*.(t|j)s',
        'src/domain/**/*.(t|j)s',
        'src/interface/**/*.(t|j)s',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};
