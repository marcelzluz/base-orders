module.exports = {
    "*.{ts,tsx}": [
        () => "tsc --noEmit --pretty",
        "eslint --quiet",
        "prettier --check --config .prettierrc",
    ],
    "*.cy.{ts,tsx}": [() => "tsc --noEmit --pretty --project ./cypress"],
    "*.{js,jsx}": ["eslint --quiet", "prettier --check --config .prettierrc"],
    "!(*.js|*.jsx|*.ts|*.tsx)": ["prettier --check --config .prettierrc"],
};
