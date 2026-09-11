const store = require("../data/accounts.store");
const { isNonEmptyString, isValidAccountType, isValidAddress, isValidBalance, isValidTransactionType, normalizeAddress, parseAccountId } = require("../utils/validation");

// v1 is intentionally a small legacy contract; v2 exposes the full account.
const toV1 = (account) => ({ id: account.id, name: account.accountHolder, balance: account.balance });
const toV2 = (account) => ({ ...account });

const error = (res, version, status, message) => res.status(status).json({ version, success: false, message });
const validId = (res, version, value) => {
    const id = parseAccountId(value);
    return id || (error(res, version, 400, "Account id must be a positive integer"), null);
};

const validateV1 = ({ name, balance }, partial = false) => {
    if (!partial && (!isNonEmptyString(name) || !isValidBalance(balance))) return "name (text) and balance (a non-negative number) are required";
    if (partial && name === undefined && balance === undefined) return "provide name or balance to update the account";
    if (name !== undefined && !isNonEmptyString(name)) return "name must be non-empty text";
    if (balance !== undefined && !isValidBalance(balance)) return "balance must be a non-negative number";
    return null;
};

const validateV2 = ({ accountNumber, accountHolder, accountType, balance, address }, partial = false) => {
    if (!partial && (!isNonEmptyString(accountHolder) || !isValidBalance(balance))) return "accountHolder (text) and balance (a non-negative number) are required";
    if (partial && accountNumber === undefined && accountHolder === undefined && accountType === undefined && balance === undefined && address === undefined) return "provide at least one account field to update";
    if (accountNumber !== undefined && !isNonEmptyString(accountNumber)) return "accountNumber must be non-empty text";
    if (accountHolder !== undefined && !isNonEmptyString(accountHolder)) return "accountHolder must be non-empty text";
    if (accountType !== undefined && !isValidAccountType(accountType)) return "accountType must be savings or current";
    if (balance !== undefined && !isValidBalance(balance)) return "balance must be a non-negative number";
    if (address !== undefined && !isValidAddress(address)) return "address must include street, city, state, postalCode, and country";
    return null;
};

const toV2Changes = ({ accountNumber, accountHolder, accountType, balance, address }) => {
    const changes = {};
    if (accountNumber !== undefined) changes.accountNumber = accountNumber.trim();
    if (accountHolder !== undefined) changes.accountHolder = accountHolder.trim();
    if (accountType !== undefined) changes.accountType = accountType;
    if (balance !== undefined) changes.balance = balance;
    if (address !== undefined) changes.address = normalizeAddress(address);
    return changes;
};

const validateTransaction = ({ type, amount, description }) => {
    if (!isValidTransactionType(type)) return "type must be credit or debit";
    if (!isValidBalance(amount) || amount === 0) return "amount must be a positive number";
    if (description !== undefined && !isNonEmptyString(description)) return "description must be non-empty text";
    return null;
};

const listV1 = (req, res) => res.json({ version: "v1", success: true, count: store.getAllAccounts().length, data: store.getAllAccounts().map(toV1) });
const getV1 = (req, res) => {
    const id = validId(res, "v1", req.params.id);
    if (!id) return;
    const account = store.getAccountById(id);
    return account ? res.json({ version: "v1", success: true, data: toV1(account) }) : error(res, "v1", 404, "Account not found");
};
const createV1 = (req, res) => {
    const message = validateV1(req.body);
    if (message) return error(res, "v1", 400, message);
    const account = store.createAccount({ accountHolder: req.body.name.trim(), balance: req.body.balance });
    return res.status(201).json({ version: "v1", success: true, data: toV1(account) });
};
const replaceV1 = (req, res) => {
    const id = validId(res, "v1", req.params.id);
    if (!id) return;
    const message = validateV1(req.body);
    if (message) return error(res, "v1", 400, message);
    const account = store.updateAccount(id, { accountHolder: req.body.name.trim(), balance: req.body.balance });
    return account ? res.json({ version: "v1", success: true, data: toV1(account) }) : error(res, "v1", 404, "Account not found");
};
const updateV1 = (req, res) => {
    const id = validId(res, "v1", req.params.id);
    if (!id) return;
    const message = validateV1(req.body, true);
    if (message) return error(res, "v1", 400, message);
    const changes = {};
    if (req.body.name !== undefined) changes.accountHolder = req.body.name.trim();
    if (req.body.balance !== undefined) changes.balance = req.body.balance;
    const account = store.updateAccount(id, changes);
    return account ? res.json({ version: "v1", success: true, data: toV1(account) }) : error(res, "v1", 404, "Account not found");
};

const listV2 = (req, res) => res.json({ version: "v2", success: true, count: store.getAllAccounts().length, data: store.getAllAccounts().map(toV2) });
const getV2 = (req, res) => {
    const id = validId(res, "v2", req.params.id);
    if (!id) return;
    const account = store.getAccountById(id);
    return account ? res.json({ version: "v2", success: true, data: toV2(account) }) : error(res, "v2", 404, "Account not found");
};
const createV2 = (req, res) => {
    const message = validateV2(req.body);
    if (message) return error(res, "v2", 400, message);
    const account = store.createAccount(toV2Changes(req.body));
    return res.status(201).json({ version: "v2", success: true, data: toV2(account) });
};
const replaceV2 = (req, res) => {
    const id = validId(res, "v2", req.params.id);
    if (!id) return;
    const message = validateV2(req.body);
    if (message) return error(res, "v2", 400, message);
    const existing = store.getAccountById(id);
    if (!existing) return error(res, "v2", 404, "Account not found");
    const account = store.updateAccount(id, { ...toV2Changes(req.body), accountNumber: req.body.accountNumber?.trim() || existing.accountNumber, accountType: req.body.accountType || "savings", address: req.body.address === undefined ? existing.address : normalizeAddress(req.body.address) });
    return res.json({ version: "v2", success: true, data: toV2(account) });
};
const updateV2 = (req, res) => {
    const id = validId(res, "v2", req.params.id);
    if (!id) return;
    const message = validateV2(req.body, true);
    if (message) return error(res, "v2", 400, message);
    const changes = toV2Changes(req.body);
    const account = store.updateAccount(id, changes);
    return account ? res.json({ version: "v2", success: true, data: toV2(account) }) : error(res, "v2", 404, "Account not found");
};

const listTransactions = (req, res) => {
    const id = validId(res, "v2", req.params.id);
    if (!id) return;
    const transactions = store.getTransactions(id);
    return transactions ? res.json({ version: "v2", success: true, count: transactions.length, data: transactions }) : error(res, "v2", 404, "Account not found");
};

const createTransaction = (req, res) => {
    const id = validId(res, "v2", req.params.id);
    if (!id) return;
    const message = validateTransaction(req.body);
    if (message) return error(res, "v2", 400, message);
    const account = store.getAccountById(id);
    if (!account) return error(res, "v2", 404, "Account not found");
    if (req.body.type === "debit" && req.body.amount > account.balance) return error(res, "v2", 400, "Insufficient balance for this debit transaction");
    const transaction = store.addTransaction(id, { ...req.body, description: req.body.description?.trim() });
    return res.status(201).json({ version: "v2", success: true, message: "Transaction added and account balance updated", data: transaction, balance: store.getAccountById(id).balance });
};

const remove = (version, mapper) => (req, res) => {
    const id = validId(res, version, req.params.id);
    if (!id) return;
    const account = store.deleteAccount(id);
    return account ? res.json({ version, success: true, data: mapper(account) }) : error(res, version, 404, "Account not found");
};

module.exports = {
    listV1, getV1, createV1, replaceV1, updateV1, deleteV1: remove("v1", toV1),
    listV2, getV2, createV2, replaceV2, updateV2, deleteV2: remove("v2", toV2),
    listTransactions, createTransaction
};
