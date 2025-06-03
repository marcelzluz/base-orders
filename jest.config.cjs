// jest.config.cjs
module.exports = {
    rootDir: ".",
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },

    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },

    transformIgnorePatterns: ["node_modules/(?!(msw|@mswjs/interceptors)/)"],

    // setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],

    testPathIgnorePatterns: ["/node_modules/", "/.next/"],

    collectCoverage: true,
    collectCoverageFrom: [
        "src/modules/**/*.ts",
        "src/components/**/*.tsx",
        "!src/**/*.stories.tsx",
        "!src/**/index.ts*",
    ],
};
