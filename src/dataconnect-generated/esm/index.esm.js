import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'asia-south1'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const listCatalogsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCatalogs');
}
listCatalogsRef.operationName = 'ListCatalogs';

export function listCatalogs(dc) {
  return executeQuery(listCatalogsRef(dc));
}

export const updateItemQuantityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateItemQuantity', inputVars);
}
updateItemQuantityRef.operationName = 'UpdateItemQuantity';

export function updateItemQuantity(dcOrVars, vars) {
  return executeMutation(updateItemQuantityRef(dcOrVars, vars));
}

export const getItemsInCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetItemsInCategory', inputVars);
}
getItemsInCategoryRef.operationName = 'GetItemsInCategory';

export function getItemsInCategory(dcOrVars, vars) {
  return executeQuery(getItemsInCategoryRef(dcOrVars, vars));
}

