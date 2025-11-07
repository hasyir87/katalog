# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCatalogs*](#listcatalogs)
  - [*GetItemsInCategory*](#getitemsincategory)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateItemQuantity*](#updateitemquantity)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCatalogs
You can execute the `ListCatalogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCatalogs(): QueryPromise<ListCatalogsData, undefined>;

interface ListCatalogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCatalogsData, undefined>;
}
export const listCatalogsRef: ListCatalogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCatalogs(dc: DataConnect): QueryPromise<ListCatalogsData, undefined>;

interface ListCatalogsRef {
  ...
  (dc: DataConnect): QueryRef<ListCatalogsData, undefined>;
}
export const listCatalogsRef: ListCatalogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCatalogsRef:
```typescript
const name = listCatalogsRef.operationName;
console.log(name);
```

### Variables
The `ListCatalogs` query has no variables.
### Return Type
Recall that executing the `ListCatalogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCatalogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCatalogsData {
  catalogs: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Catalog_Key)[];
}
```
### Using `ListCatalogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCatalogs } from '@dataconnect/generated';


// Call the `listCatalogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCatalogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCatalogs(dataConnect);

console.log(data.catalogs);

// Or, you can use the `Promise` API.
listCatalogs().then((response) => {
  const data = response.data;
  console.log(data.catalogs);
});
```

### Using `ListCatalogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCatalogsRef } from '@dataconnect/generated';


// Call the `listCatalogsRef()` function to get a reference to the query.
const ref = listCatalogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCatalogsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.catalogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.catalogs);
});
```

## GetItemsInCategory
You can execute the `GetItemsInCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getItemsInCategory(vars: GetItemsInCategoryVariables): QueryPromise<GetItemsInCategoryData, GetItemsInCategoryVariables>;

interface GetItemsInCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemsInCategoryVariables): QueryRef<GetItemsInCategoryData, GetItemsInCategoryVariables>;
}
export const getItemsInCategoryRef: GetItemsInCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getItemsInCategory(dc: DataConnect, vars: GetItemsInCategoryVariables): QueryPromise<GetItemsInCategoryData, GetItemsInCategoryVariables>;

interface GetItemsInCategoryRef {
  ...
  (dc: DataConnect, vars: GetItemsInCategoryVariables): QueryRef<GetItemsInCategoryData, GetItemsInCategoryVariables>;
}
export const getItemsInCategoryRef: GetItemsInCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getItemsInCategoryRef:
```typescript
const name = getItemsInCategoryRef.operationName;
console.log(name);
```

### Variables
The `GetItemsInCategory` query requires an argument of type `GetItemsInCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetItemsInCategoryVariables {
  categoryId: UUIDString;
}
```
### Return Type
Recall that executing the `GetItemsInCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetItemsInCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetItemsInCategoryData {
  items: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    quantity?: number | null;
  } & Item_Key)[];
}
```
### Using `GetItemsInCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getItemsInCategory, GetItemsInCategoryVariables } from '@dataconnect/generated';

// The `GetItemsInCategory` query requires an argument of type `GetItemsInCategoryVariables`:
const getItemsInCategoryVars: GetItemsInCategoryVariables = {
  categoryId: ..., 
};

// Call the `getItemsInCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getItemsInCategory(getItemsInCategoryVars);
// Variables can be defined inline as well.
const { data } = await getItemsInCategory({ categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getItemsInCategory(dataConnect, getItemsInCategoryVars);

console.log(data.items);

// Or, you can use the `Promise` API.
getItemsInCategory(getItemsInCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

### Using `GetItemsInCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getItemsInCategoryRef, GetItemsInCategoryVariables } from '@dataconnect/generated';

// The `GetItemsInCategory` query requires an argument of type `GetItemsInCategoryVariables`:
const getItemsInCategoryVars: GetItemsInCategoryVariables = {
  categoryId: ..., 
};

// Call the `getItemsInCategoryRef()` function to get a reference to the query.
const ref = getItemsInCategoryRef(getItemsInCategoryVars);
// Variables can be defined inline as well.
const ref = getItemsInCategoryRef({ categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getItemsInCategoryRef(dataConnect, getItemsInCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.items);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.items);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateItemQuantity
You can execute the `UpdateItemQuantity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateItemQuantity(vars: UpdateItemQuantityVariables): MutationPromise<UpdateItemQuantityData, UpdateItemQuantityVariables>;

interface UpdateItemQuantityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemQuantityVariables): MutationRef<UpdateItemQuantityData, UpdateItemQuantityVariables>;
}
export const updateItemQuantityRef: UpdateItemQuantityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateItemQuantity(dc: DataConnect, vars: UpdateItemQuantityVariables): MutationPromise<UpdateItemQuantityData, UpdateItemQuantityVariables>;

interface UpdateItemQuantityRef {
  ...
  (dc: DataConnect, vars: UpdateItemQuantityVariables): MutationRef<UpdateItemQuantityData, UpdateItemQuantityVariables>;
}
export const updateItemQuantityRef: UpdateItemQuantityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateItemQuantityRef:
```typescript
const name = updateItemQuantityRef.operationName;
console.log(name);
```

### Variables
The `UpdateItemQuantity` mutation requires an argument of type `UpdateItemQuantityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateItemQuantityVariables {
  id: UUIDString;
  quantity: number;
}
```
### Return Type
Recall that executing the `UpdateItemQuantity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateItemQuantityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateItemQuantityData {
  item_update?: Item_Key | null;
}
```
### Using `UpdateItemQuantity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateItemQuantity, UpdateItemQuantityVariables } from '@dataconnect/generated';

// The `UpdateItemQuantity` mutation requires an argument of type `UpdateItemQuantityVariables`:
const updateItemQuantityVars: UpdateItemQuantityVariables = {
  id: ..., 
  quantity: ..., 
};

// Call the `updateItemQuantity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateItemQuantity(updateItemQuantityVars);
// Variables can be defined inline as well.
const { data } = await updateItemQuantity({ id: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateItemQuantity(dataConnect, updateItemQuantityVars);

console.log(data.item_update);

// Or, you can use the `Promise` API.
updateItemQuantity(updateItemQuantityVars).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

### Using `UpdateItemQuantity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateItemQuantityRef, UpdateItemQuantityVariables } from '@dataconnect/generated';

// The `UpdateItemQuantity` mutation requires an argument of type `UpdateItemQuantityVariables`:
const updateItemQuantityVars: UpdateItemQuantityVariables = {
  id: ..., 
  quantity: ..., 
};

// Call the `updateItemQuantityRef()` function to get a reference to the mutation.
const ref = updateItemQuantityRef(updateItemQuantityVars);
// Variables can be defined inline as well.
const ref = updateItemQuantityRef({ id: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateItemQuantityRef(dataConnect, updateItemQuantityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.item_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.item_update);
});
```

