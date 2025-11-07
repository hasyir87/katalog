const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const listCatalogsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCatalogs');
}
listCatalogsRef.operationName = 'ListCatalogs';
exports.listCatalogsRef = listCatalogsRef;

exports.listCatalogs = function listCatalogs(dc) {
  return executeQuery(listCatalogsRef(dc));
};

const updateItemQuantityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateItemQuantity', inputVars);
}
updateItemQuantityRef.operationName = 'UpdateItemQuantity';
exports.updateItemQuantityRef = updateItemQuantityRef;

exports.updateItemQuantity = function updateItemQuantity(dcOrVars, vars) {
  return executeMutation(updateItemQuantityRef(dcOrVars, vars));
};

const getItemsInCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetItemsInCategory', inputVars);
}
getItemsInCategoryRef.operationName = 'GetItemsInCategory';
exports.getItemsInCategoryRef = getItemsInCategoryRef;

exports.getItemsInCategory = function getItemsInCategory(dcOrVars, vars) {
  return executeQuery(getItemsInCategoryRef(dcOrVars, vars));
};
