const accounts = [
    {
        id: 1,
        accountNumber: "ACC1001",
        name: "Harshal",
        accountType: "savings",
        balance: 50000
    },
    {
        id: 2,
        accountNumber: "ACC1002",
        name: "Rahul",
        accountType: "current",
        balance: 75000
    }
];

const getAccountById = (req, res) => {
    const id = Number(req.params.id);

    const account = accounts.find(account => account.id === id);

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found"
        });
    }

    res.status(200).json({
        success: true,
        data: account
    });
};

const getAllAccounts = (req, res) => {
    res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
    });
};

module.exports = {
    getAllAccounts,
    getAccountById
};