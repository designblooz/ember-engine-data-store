import Ember from 'ember';
import DebugAdapter from 'ember-data/-private/system/debug/debug-adapter';
import { assert, warn } from "ember-data/-private/debug";

const { inject, getOwner, isBlank, isPresent } = Ember;

export default DebugAdapter.extend({
  engineStore: inject.service('engine-store'),
  getRecords(modelClass, modelName = '') {
    let records;
    const owner = getOwner(this);
    const app = owner.application;
    const modulePrefix = modelName.split('#').shift();

    if (!modelName.includes(modulePrefix)) {
      records = this.get('engineStore').peekAll(modelName);
    }
    else {
      records = this._super(...arguments);
    }

    return records;
  },
  getModelTypes() {
    let containerDebugAdapter = this.get('containerDebugAdapter');
    let types;

    if (containerDebugAdapter.canCatalogEntriesByType('model')) {
      types = containerDebugAdapter.catalogEntriesByType('model');
    } else {
      types = this._getObjectsOnNamespaces();
    }

    // New adapters return strings instead of classes.
    types = Ember.A(types).map((name) => {
      return this._getKlassName(name);
    });

    types = Ember.A(types).filter(type => this.detect(type.klass));

    return Ember.A(types);
  },
  _getKlassName(name) {
    let modelClass = this._nameToClass(name);
    let appName = getOwner(this).application.modulePrefix;

    if(!isBlank(modelClass) && !modelClass.toString().includes(appName)) {
      name = `${modelClass.toString().split('@').shift()}#${name}`;
    }

    return {
      klass: modelClass,
      name: name
    }
  },
  _nameToClass(type) {
    let model, engineName, engineStore;
    let typeSplit = type.split('#');
    let modelName = typeSplit.pop();

    if(typeSplit.length) {
      engineName = typeSplit.shift();
      engineStore = this.get('engineStore').storeFor(engineName);
    }

    if (typeof type === 'string') {
      model = getOwner(this)._lookupFactory(`model:${type}`);

      if(isBlank(model) && engineStore) {
        model = engineStore.modelFactoryFor(modelName);
      }
      else if(isBlank(model)) {
        model = this.get('engineStore').lookupFactory(`model:${type}`);
      }
    }

    return model;
  }
});
