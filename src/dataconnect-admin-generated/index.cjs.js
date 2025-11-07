const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'studio',
  location: 'asia-south1'
};
exports.connectorConfig = connectorConfig;

function createUser(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateUser', inputVars, inputOpts);
};
exports.createUser = createUser;

function listCatalogs(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListCatalogs', inputVars, inputOpts);
};
exports.listCatalogs = listCatalogs;

function updateItemQuantity(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateItemQuantity', inputVars, inputOpts);
};
exports.updateItemQuantity = updateItemQuantity;

function getItemsInCategory(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetItemsInCategory', inputVars, inputOpts);
};
exports.getItemsInCategory = getItemsInCategory;

