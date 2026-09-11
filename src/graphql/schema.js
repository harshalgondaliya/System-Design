const { buildSchema, GraphQLError } = require("graphql");
const store = require("../data/accounts.store");
const { isNonEmptyString, isValidAccountType, isValidAddress, isValidBalance, isValidTransactionType, normalizeAddress, parseAccountId } = require("../utils/validation");

const schema = buildSchema(`
    type Address { street: String!, city: String!, state: String!, postalCode: String!, country: String! }
    type Transaction { id: ID!, type: String!, amount: Float!, description: String!, createdAt: String! }
    type Account {
        id: ID!
        accountNumber: String!
        accountHolder: String!
        accountType: String!
        balance: Float!
        address: Address
        transactions: [Transaction!]!
    }
    input AddressInput { street: String!, city: String!, state: String!, postalCode: String!, country: String! }
    input CreateAccountInput { accountNumber: String, accountHolder: String!, accountType: String = "savings", balance: Float!, address: AddressInput }
    input UpdateAccountInput { accountNumber: String, accountHolder: String, accountType: String, balance: Float, address: AddressInput }
    input CreateTransactionInput { type: String!, amount: Float!, description: String }
    type Query { accounts: [Account!]!, account(id: ID!): Account }
    type Mutation {
        createAccount(input: CreateAccountInput!): Account!
        updateAccount(id: ID!, input: UpdateAccountInput!): Account!
        deleteAccount(id: ID!): Account!
        addTransaction(accountId: ID!, input: CreateTransactionInput!): Transaction!
    }
`);

const inputError = (message) => {
    throw new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
};

const notFoundError = () => {
    throw new GraphQLError("Account not found", { extensions: { code: "NOT_FOUND" } });
};

const validateAccountInput = ({ accountNumber, accountHolder, accountType, balance, address }, partial = false) => {
    if (!partial && (!isNonEmptyString(accountHolder) || !isValidBalance(balance))) inputError("accountHolder and a non-negative balance are required");
    if (partial && accountNumber === undefined && accountHolder === undefined && accountType === undefined && balance === undefined && address === undefined) inputError("provide at least one account field to update");
    if (accountNumber !== undefined && !isNonEmptyString(accountNumber)) inputError("accountNumber must be non-empty text");
    if (accountHolder !== undefined && !isNonEmptyString(accountHolder)) inputError("accountHolder must be non-empty text");
    if (accountType !== undefined && !isValidAccountType(accountType)) inputError("accountType must be savings or current");
    if (balance !== undefined && !isValidBalance(balance)) inputError("balance must be a non-negative number");
    if (address !== undefined && !isValidAddress(address)) inputError("address must include street, city, state, postalCode, and country");
};

const normalizeAccountInput = ({ accountNumber, accountHolder, accountType, balance, address }) => {
    const changes = {};
    if (accountNumber !== undefined) changes.accountNumber = accountNumber.trim();
    if (accountHolder !== undefined) changes.accountHolder = accountHolder.trim();
    if (accountType !== undefined) changes.accountType = accountType;
    if (balance !== undefined) changes.balance = balance;
    if (address !== undefined) changes.address = normalizeAddress(address);
    return changes;
};

const findAccount = (id) => {
    const validId = parseAccountId(id);
    if (!validId) inputError("id must be a positive integer");
    const account = store.getAccountById(validId);
    if (!account) notFoundError();
    return account;
};

const validateTransaction = ({ type, amount, description }) => {
    if (!isValidTransactionType(type)) inputError("type must be credit or debit");
    if (!isValidBalance(amount) || amount === 0) inputError("amount must be a positive number");
    if (description !== undefined && !isNonEmptyString(description)) inputError("description must be non-empty text");
};

const root = {
    accounts: () => store.getAllAccounts(),
    account: ({ id }) => store.getAccountById(id),
    createAccount: ({ input }) => {
        validateAccountInput(input);
        return store.createAccount(normalizeAccountInput(input));
    },
    updateAccount: ({ id, input }) => {
        findAccount(id);
        validateAccountInput(input, true);
        return store.updateAccount(id, normalizeAccountInput(input));
    },
    deleteAccount: ({ id }) => {
        findAccount(id);
        return store.deleteAccount(id);
    },
    addTransaction: ({ accountId, input }) => {
        const account = findAccount(accountId);
        validateTransaction(input);
        if (input.type === "debit" && input.amount > account.balance) inputError("insufficient balance for this debit transaction");
        return store.addTransaction(accountId, { ...input, description: input.description?.trim() });
    }
};

module.exports = { schema, root };
