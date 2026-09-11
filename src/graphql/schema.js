const { buildSchema, GraphQLError } = require("graphql");
const store = require("../data/accounts.store");
const { isNonEmptyString, isValidAccountType, isValidBalance, parseAccountId } = require("../utils/validation");

const schema = buildSchema(`
    type Account { id: ID!, accountNumber: String!, accountHolder: String!, accountType: String!, balance: Float! }
    input CreateAccountInput { accountNumber: String, accountHolder: String!, accountType: String = "savings", balance: Float! }
    input UpdateAccountInput { accountNumber: String, accountHolder: String, accountType: String, balance: Float }
    type Query { accounts: [Account!]!, account(id: ID!): Account }
    type Mutation {
        createAccount(input: CreateAccountInput!): Account!
        updateAccount(id: ID!, input: UpdateAccountInput!): Account!
        deleteAccount(id: ID!): Account!
    }
`);

const inputError = (message) => {
    throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
};

const validateInput = ({ accountNumber, accountHolder, accountType, balance }, partial = false) => {
    if (!partial && (!isNonEmptyString(accountHolder) || !isValidBalance(balance))) inputError("accountHolder and a non-negative balance are required");
    if (partial && accountNumber === undefined && accountHolder === undefined && accountType === undefined && balance === undefined) inputError("provide at least one account field to update");
    if (accountNumber !== undefined && !isNonEmptyString(accountNumber)) inputError("accountNumber must be non-empty text");
    if (accountHolder !== undefined && !isNonEmptyString(accountHolder)) inputError("accountHolder must be non-empty text");
    if (accountType !== undefined && !isValidAccountType(accountType)) inputError("accountType must be savings or current");
    if (balance !== undefined && !isValidBalance(balance)) inputError("balance must be a non-negative number");
};

const findAccount = (id) => {
    const validId = parseAccountId(id);
    if (!validId) inputError("id must be a positive integer");
    const account = store.getAccountById(validId);
    if (!account) throw new GraphQLError("Account not found", { extensions: { code: "NOT_FOUND" } });
    return account;
};

const root = {
    accounts: () => store.getAllAccounts(),
    account: ({ id }) => store.getAccountById(id),
    createAccount: ({ input }) => {
        validateInput(input);
        return store.createAccount({ ...input, accountNumber: input.accountNumber?.trim(), accountHolder: input.accountHolder.trim() });
    },
    updateAccount: ({ id, input }) => {
        findAccount(id);
        validateInput(input, true);
        const changes = { ...input };
        if (changes.accountNumber !== undefined) changes.accountNumber = changes.accountNumber.trim();
        if (changes.accountHolder !== undefined) changes.accountHolder = changes.accountHolder.trim();
        return store.updateAccount(id, changes);
    },
    deleteAccount: ({ id }) => {
        findAccount(id);
        return store.deleteAccount(id);
    }
};

module.exports = { schema, root };
