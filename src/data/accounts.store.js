const initialAccounts = [
    {
        id: 1,
        accountNumber: "ACC1001",
        accountHolder: "Harshal",
        accountType: "savings",
        balance: 50000,
        address: { street: "12 University Road", city: "Ahmedabad", state: "Gujarat", postalCode: "380009", country: "India" },
        transactions: [
            { id: "TXN1001", type: "credit", amount: 50000, description: "Opening deposit", createdAt: "2026-01-05T09:30:00.000Z" },
            { id: "TXN1002", type: "debit", amount: 1200, description: "Electricity bill", createdAt: "2026-01-10T11:15:00.000Z" }
        ]
    },
    {
        id: 2,
        accountNumber: "ACC1002",
        accountHolder: "Rahul",
        accountType: "current",
        balance: 75000,
        address: { street: "45 River Front", city: "Surat", state: "Gujarat", postalCode: "395003", country: "India" },
        transactions: [
            { id: "TXN1003", type: "credit", amount: 75000, description: "Business deposit", createdAt: "2026-01-08T10:00:00.000Z" }
        ]
    }
];

let accounts = structuredClone(initialAccounts);
let nextId = accounts.length + 1;
let nextTransactionId = 1004;

const getAllAccounts = () => accounts;
const getAccountById = (id) => accounts.find((account) => account.id === Number(id));

const createAccount = ({ accountNumber, accountHolder, accountType, balance, address }) => {
    const account = {
        id: nextId++,
        accountNumber: accountNumber || `ACC${1000 + nextId - 1}`,
        accountHolder,
        accountType: accountType || "savings",
        balance: Number(balance),
        address: address || null,
        transactions: []
    };
    accounts.push(account);
    return account;
};

const updateAccount = (id, changes) => {
    const account = getAccountById(id);
    return account ? Object.assign(account, changes) : null;
};

const getTransactions = (accountId) => getAccountById(accountId)?.transactions || null;

const addTransaction = (accountId, { type, amount, description }) => {
    const account = getAccountById(accountId);
    if (!account) return null;

    const transaction = {
        id: `TXN${nextTransactionId++}`,
        type,
        amount: Number(amount),
        description: description || "Account transaction",
        createdAt: new Date().toISOString()
    };
    account.transactions.push(transaction);
    account.balance = Number((account.balance + (type === "credit" ? transaction.amount : -transaction.amount)).toFixed(2));
    return transaction;
};

const deleteAccount = (id) => {
    const index = accounts.findIndex((account) => account.id === Number(id));
    return index === -1 ? null : accounts.splice(index, 1)[0];
};

module.exports = { addTransaction, createAccount, deleteAccount, getAccountById, getAllAccounts, getTransactions, updateAccount };
