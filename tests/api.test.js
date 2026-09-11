const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;

before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
}));

after(() => new Promise((resolve) => server.close(resolve)));

test("v1 exposes its legacy account shape", async () => {
    const response = await fetch(`${baseUrl}/api/v1/accounts`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.version, "v1");
    assert.deepEqual(Object.keys(body.data[0]), ["id", "name", "balance"]);
});

test("v2 creates an account that GraphQL can query", async () => {
    const createResponse = await fetch(`${baseUrl}/api/v2/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountHolder: "Asha", accountType: "savings", balance: 1250 })
    });
    const created = await createResponse.json();
    const queryResponse = await fetch(`${baseUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `{ account(id: ${created.data.id}) { accountHolder balance } }` })
    });
    const queried = await queryResponse.json();
    assert.equal(createResponse.status, 201);
    assert.deepEqual(queried.data.account, { accountHolder: "Asha", balance: 1250 });
});

test("invalid balances receive a clear validation error", async () => {
    const response = await fetch(`${baseUrl}/api/v2/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountHolder: "Asha", balance: -1 })
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
});

test("GraphQL mutation updates the same account used by REST", async () => {
    const mutationResponse = await fetch(`${baseUrl}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: 'mutation { updateAccount(id: "1", input: { balance: 51000 }) { id balance } }'
        })
    });
    const mutated = await mutationResponse.json();
    const restResponse = await fetch(`${baseUrl}/api/v2/accounts/1`);
    const restAccount = await restResponse.json();

    assert.deepEqual(mutated.data.updateAccount, { id: "1", balance: 51000 });
    assert.equal(restAccount.data.balance, 51000);
});
