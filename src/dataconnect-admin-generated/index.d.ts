import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Catalog_Key {
  id: UUIDString;
  __typename?: 'Catalog_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface GetItemsInCategoryData {
  items: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    quantity?: number | null;
  } & Item_Key)[];
}

export interface GetItemsInCategoryVariables {
  categoryId: UUIDString;
}

export interface Item_Key {
  id: UUIDString;
  __typename?: 'Item_Key';
}

export interface ListCatalogsData {
  catalogs: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Catalog_Key)[];
}

export interface UpdateItemQuantityData {
  item_update?: Item_Key | null;
}

export interface UpdateItemQuantityVariables {
  id: UUIDString;
  quantity: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListCatalogs' Query. Allow users to execute without passing in DataConnect. */
export function listCatalogs(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCatalogsData>>;
/** Generated Node Admin SDK operation action function for the 'ListCatalogs' Query. Allow users to pass in custom DataConnect instances. */
export function listCatalogs(options?: OperationOptions): Promise<ExecuteOperationResponse<ListCatalogsData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateItemQuantity' Mutation. Allow users to execute without passing in DataConnect. */
export function updateItemQuantity(dc: DataConnect, vars: UpdateItemQuantityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateItemQuantityData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateItemQuantity' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateItemQuantity(vars: UpdateItemQuantityVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateItemQuantityData>>;

/** Generated Node Admin SDK operation action function for the 'GetItemsInCategory' Query. Allow users to execute without passing in DataConnect. */
export function getItemsInCategory(dc: DataConnect, vars: GetItemsInCategoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetItemsInCategoryData>>;
/** Generated Node Admin SDK operation action function for the 'GetItemsInCategory' Query. Allow users to pass in custom DataConnect instances. */
export function getItemsInCategory(vars: GetItemsInCategoryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetItemsInCategoryData>>;

