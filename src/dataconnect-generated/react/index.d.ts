import { CreateUserData, ListCatalogsData, UpdateItemQuantityData, UpdateItemQuantityVariables, GetItemsInCategoryData, GetItemsInCategoryVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useListCatalogs(options?: useDataConnectQueryOptions<ListCatalogsData>): UseDataConnectQueryResult<ListCatalogsData, undefined>;
export function useListCatalogs(dc: DataConnect, options?: useDataConnectQueryOptions<ListCatalogsData>): UseDataConnectQueryResult<ListCatalogsData, undefined>;

export function useUpdateItemQuantity(options?: useDataConnectMutationOptions<UpdateItemQuantityData, FirebaseError, UpdateItemQuantityVariables>): UseDataConnectMutationResult<UpdateItemQuantityData, UpdateItemQuantityVariables>;
export function useUpdateItemQuantity(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateItemQuantityData, FirebaseError, UpdateItemQuantityVariables>): UseDataConnectMutationResult<UpdateItemQuantityData, UpdateItemQuantityVariables>;

export function useGetItemsInCategory(vars: GetItemsInCategoryVariables, options?: useDataConnectQueryOptions<GetItemsInCategoryData>): UseDataConnectQueryResult<GetItemsInCategoryData, GetItemsInCategoryVariables>;
export function useGetItemsInCategory(dc: DataConnect, vars: GetItemsInCategoryVariables, options?: useDataConnectQueryOptions<GetItemsInCategoryData>): UseDataConnectQueryResult<GetItemsInCategoryData, GetItemsInCategoryVariables>;
