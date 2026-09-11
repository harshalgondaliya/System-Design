const initialAccounts = [
    { id: 1, accountNumber: "ACC1001", accountHolder: "Harshal", accountType: "savings", balance: 50000 },
    { id: 2, accountNumber: "ACC1002", accountHolder: "Rahul", accountType: "current", balance: 75000 }
];

let accounts = initialAccounts.map((account) => ({ ...account }));
let nextId = accounts.length + 1;

const getAllAccounts = () => accounts;
const getAccountById = (id) => accounts.find((account) => account.id === Number(id));

const createAccount = ({ accountNumber, accountHolder, accountType, balance }) => {
    const account = {
        id: nextId++,
        accountNumber: accountNumber || `ACC${1000 + nextId - 1}`,
        accountHolder,
        accountType: accountType || "savings",
        balance: Number(balance)
    };
    accounts.push(account);
    return account;
};

const updateAccount = (id, changes) => {
    const account = getAccountById(id);
    return account ? Object.assign(account, changes) : null;
};

const deleteAccount = (id) => {
    const index = accounts.findIndex((account) => account.id === Number(id));
    return index === -1 ? null : accounts.splice(index, 1)[0];
};

module.exports = { createAccount, deleteAccount, getAccountById, getAllAccounts, updateAccount };
