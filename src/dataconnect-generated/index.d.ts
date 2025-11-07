import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListCatalogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCatalogsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCatalogsData, undefined>;
  operationName: string;
}
export const listCatalogsRef: ListCatalogsRef;

export function listCatalogs(): QueryPromise<ListCatalogsData, undefined>;
export function listCatalogs(dc: DataConnect): QueryPromise<ListCatalogsData, undefined>;

interface UpdateItemQuantityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateItemQuantityVariables): MutationRef<UpdateItemQuantityData, UpdateItemQuantityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateItemQuantityVariables): MutationRef<UpdateItemQuantityData, UpdateItemQuantityVariables>;
  operationName: string;
}
export const updateItemQuantityRef: UpdateItemQuantityRef;

export function updateItemQuantity(vars: UpdateItemQuantityVariables): MutationPromise<UpdateItemQuantityData, UpdateItemQuantityVariables>;
export function updateItemQuantity(dc: DataConnect, vars: UpdateItemQuantityVariables): MutationPromise<UpdateItemQuantityData, UpdateItemQuantityVariables>;

interface GetItemsInCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetItemsInCategoryVariables): QueryRef<GetItemsInCategoryData, GetItemsInCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetItemsInCategoryVariables): QueryRef<GetItemsInCategoryData, GetItemsInCategoryVariables>;
  operationName: string;
}
export const getItemsInCategoryRef: GetItemsInCategoryRef;

export function getItemsInCategory(vars: GetItemsInCategoryVariables): QueryPromise<GetItemsInCategoryData, GetItemsInCategoryVariables>;
export function getItemsInCategory(dc: DataConnect, vars: GetItemsInCategoryVariables): QueryPromise<GetItemsInCategoryData, GetItemsInCategoryVariables>;

