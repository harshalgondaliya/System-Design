# Bank API practice project

An Express project for practising REST endpoints, URL versioning, and GraphQL. Data is stored in memory, so it resets whenever the server restarts.

This project is a small bank-account backend where you can practise the complete API flow: create, read, update, and delete accounts through REST v1, REST v2, or GraphQL. Version 1 demonstrates an older, simple response format, while version 2 demonstrates an improved account format without breaking v1 clients. GraphQL provides flexible queries and mutations at one endpoint. All three interfaces use the same shared account data, so a change made through one interface is immediately visible through the others.

## 1. Install and run

Open a terminal in this project folder, then run:

```bash
# Install packages (only needed the first time or after cloning the project)
npm install

# Start the API
npm start
```

The terminal should show:

```text
Bank API running on http://localhost:3000
```

For development, use this instead. It restarts the server after you save a file:

```bash
npm run dev
```

To run the automated checks:

```bash
npm test
```

Important: accounts are stored only in memory. Restarting the server restores the two sample accounts.

## 2. Where to test

You can use any of these:

- **Postman** — best for learning REST methods, headers, request bodies, and status codes.
- **GraphiQL** — built into this project at `http://localhost:3000/graphql`; best for GraphQL queries and mutations.
- **Browser** — useful for simple `GET` requests such as `http://localhost:3000/api/v2/accounts`.
- **Terminal** — run `npm test` for the included automated tests.

## 3. Test REST in Postman

1. Start the server with `npm start`.
2. Open Postman and create a collection named **Bank API Practice**.
3. Create a variable named `baseUrl` with value `http://localhost:3000` (optional, but recommended).
4. For every request that sends JSON, open the **Body** tab, choose **raw**, select **JSON**, and set the header `Content-Type: application/json`.

Use `{{baseUrl}}` below if you created the variable; otherwise replace it with `http://localhost:3000`.

### v1 — legacy API contract

v1 keeps the older, simpler field names: `id`, `name`, and `balance`.

| Action | Method | URL | Body |
| --- | --- | --- | --- |
| List accounts | `GET` | `{{baseUrl}}/api/v1/accounts` | none |
| Get one account | `GET` | `{{baseUrl}}/api/v1/accounts/1` | none |
| Create | `POST` | `{{baseUrl}}/api/v1/accounts` | `{"name":"Asha","balance":1250}` |
| Replace | `PUT` | `{{baseUrl}}/api/v1/accounts/1` | `{"name":"Harshal Patel","balance":51000}` |
| Update partly | `PATCH` | `{{baseUrl}}/api/v1/accounts/1` | `{"balance":51000}` |
| Delete | `DELETE` | `{{baseUrl}}/api/v1/accounts/1` | none |

### v2 — improved API contract

v2 adds `accountNumber`, `accountHolder`, and `accountType`. Use this version for new clients.

| Action | Method | URL | Body |
| --- | --- | --- | --- |
| List accounts | `GET` | `{{baseUrl}}/api/v2/accounts` | none |
| Get one account | `GET` | `{{baseUrl}}/api/v2/accounts/1` | none |
| Create | `POST` | `{{baseUrl}}/api/v2/accounts` | see below |
| Replace | `PUT` | `{{baseUrl}}/api/v2/accounts/1` | see below |
| Update partly | `PATCH` | `{{baseUrl}}/api/v2/accounts/1` | `{"balance":51000}` |
| Delete | `DELETE` | `{{baseUrl}}/api/v2/accounts/1` | none |

Use this JSON body when creating an account in v2. `accountNumber` is optional and is generated if you omit it.

```json
{
  "accountHolder": "Asha",
  "accountType": "savings",
  "balance": 1250
}
```

For a `PUT` request, send the values you want the account to have:

```json
{
  "accountNumber": "ACC1001",
  "accountHolder": "Harshal Patel",
  "accountType": "savings",
  "balance": 51000
}
```

`accountType` must be `savings` or `current`; `balance` must be a non-negative number. A successful create returns status **201**. Invalid input returns **400**; an account that does not exist returns **404**.

## 4. Test GraphQL in GraphiQL

1. Keep the API running.
2. Open `http://localhost:3000/graphql` in your browser.
3. Paste one operation below into the left panel.
4. Click the triangular **Run** button.

Query all accounts:

```graphql
query {
  accounts {
    id
    accountNumber
    accountHolder
    accountType
    balance
  }
}
```

Create an account:

```graphql
mutation {
  createAccount(input: {
    accountHolder: "Asha"
    accountType: "savings"
    balance: 1250
  }) {
    id
    accountNumber
    accountHolder
  }
}
```

Update one field:

```graphql
mutation {
  updateAccount(id: "1", input: { balance: 51000 }) {
    id
    accountHolder
    balance
  }
}
```

Delete an account:

```graphql
mutation {
  deleteAccount(id: "1") {
    id
    accountHolder
  }
}
```

REST and GraphQL use the same account store. An account created through v2 can immediately be queried from GraphQL.

## 5. Core concepts to remember

### What is an API?

An **API** is a way for one application to ask another application for data or to change data. In this project, Postman or a frontend sends a request to the Express server.

Example: this request asks the server for all v2 accounts:

```http
GET /api/v2/accounts
```

The server responds with JSON account data.

### What is API versioning?

**Versioning** lets an API improve without suddenly breaking old applications that still use the old format.

In this project, the same account looks different in each version:

| Version | Example response fields | Why it exists |
| --- | --- | --- |
| v1 | `id`, `name`, `balance` | Older clients can keep working. |
| v2 | `id`, `accountNumber`, `accountHolder`, `accountType`, `balance` | New clients receive a better account format. |

For example, an old application can call `/api/v1/accounts/1`, while a new application can call `/api/v2/accounts/1`.

### What is GraphQL?

**GraphQL** is another way to use the API. With REST, you choose a URL such as `/api/v2/accounts`. With GraphQL, you send a query to one URL, `/graphql`, and choose the fields you want back.

Example: ask only for a holder name and balance:

```graphql
query {
  account(id: "1") {
    accountHolder
    balance
  }
}
```

### Do v1, v2, and GraphQL share data?

**Yes.** In this project, they are three different doors to the same account store.

```text
Postman -> REST v1 ---\
Postman -> REST v2 ----> shared account data
GraphiQL -> GraphQL ---/
```

Therefore, these actions affect every interface:

| Action | Result |
| --- | --- |
| Create an account through v2 | The account can be read through v1 and GraphQL. |
| Update an account through GraphQL | The changed value appears in v1 and v2. |
| Delete `id: 1` through GraphQL | `GET /api/v1/accounts/1` and `GET /api/v2/accounts/1` both return `404 Account not found`. |

For example, after running this GraphQL mutation:

```graphql
mutation {
  deleteAccount(id: "1") {
    id
  }
}
```

Account `1` is deleted from the shared store. It is not only deleted from GraphQL.

In this practice project, data is an in-memory JavaScript array, so restarting the server brings the sample accounts back. In a real application, v1, v2, and GraphQL would normally share one database such as MongoDB or MySQL.
