const ACCOUNT_TYPES = ["savings", "current"];
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isValidBalance = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const isValidAccountType = (value) => ACCOUNT_TYPES.includes(value);
const parseAccountId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

module.exports = { ACCOUNT_TYPES, isNonEmptyString, isValidAccountType, isValidBalance, parseAccountId };
