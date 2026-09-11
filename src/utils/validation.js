const ACCOUNT_TYPES = ["savings", "current"];
const TRANSACTION_TYPES = ["credit", "debit"];
const ADDRESS_FIELDS = ["street", "city", "state", "postalCode", "country"];
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isValidBalance = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const isValidAccountType = (value) => ACCOUNT_TYPES.includes(value);
const isValidTransactionType = (value) => TRANSACTION_TYPES.includes(value);
const isValidAddress = (value) => value !== null && typeof value === "object" && !Array.isArray(value) && ADDRESS_FIELDS.every((field) => isNonEmptyString(value[field]));
const normalizeAddress = (address) => Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, address[field].trim()]));
const parseAccountId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

module.exports = { ACCOUNT_TYPES, TRANSACTION_TYPES, isNonEmptyString, isValidAccountType, isValidAddress, isValidBalance, isValidTransactionType, normalizeAddress, parseAccountId };
