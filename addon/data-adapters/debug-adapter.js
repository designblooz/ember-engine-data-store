import Ember from 'ember';
import DS from 'ember-data';

const { inject, getOwner, isBlank, isPresent } = Ember;

function getPod(type, key, prefix) {
  var match = key.match(new RegExp('^/?' + prefix + '/(.+)/' + type + '$'));
  if (match) {
    return match[1];
  }
}

export default DS.DebugAdapter.extend({
  engineStore: inject.service('engine-store'),
  getRecords(modelClass, modelName = '') {
    let records;

    if (modelName.includes('#')) {
      records = this.get('engineStore').peekAll(modelName);
    }
    else {
      records = this._super(...arguments);
    }

    return records;
  },
  getModelTypes() {
    const containerDebugAdapter = this.get('containerDebugAdapter');
    let types = this.getModelEntries();

    // New adapters return strings instead of classes.
    types = Ember.A(types).map((type) => {
      return this._getKlassName(type);
    });

    types = Ember.A(types).filter(type => this.detect(type && type.klass));

    return Ember.A(types);
  },

  getModelEntries() {
    const containerDebugAdapter = this.get('containerDebugAdapter');
    const moduleNames = containerDebugAdapter._moduleRegistry.moduleNames();
    const types = Ember.A();
    const type = 'model';

    const prefix = containerDebugAdapter.namespace.modulePrefix;

    for (let i = 0, l = moduleNames.length; i < l; i++) {
      const key = moduleNames[i];

      if (key.includes(type) && this._isAppModel(key)) {
        let name = getPod(type, key, containerDebugAdapter.namespace.podModulePrefix || prefix);
        if (!name) {
          const splitKey = key.split('/');
          name = {
            modulePrefix: splitKey.shift(),
            name: key.split('models/').pop()
          }
        }
        types.addObject(name);
      }
    }
    return types;
  },

  _isAppModel(moduleName) {
    const appPrefixes = this._getAppPrefixes();
    const isAppModelName = appPrefixes.find(prefix => moduleName.includes(prefix));
    const isAppModel = isAppModelName ? moduleName.split('models/').length > 1 : false;
    const isMirage = moduleName.includes('mirage');

    return isAppModel && !isMirage;
  },

  _getAppPrefixes() {
    const containerDebugAdapter = this.get('containerDebugAdapter');
    const namespaces = Ember.A();

    namespaces.push(containerDebugAdapter.namespace.modulePrefix);
    Object.keys(containerDebugAdapter.namespace.engines).forEach(engine =>
      namespaces.push(Ember.String.dasherize(engine))
    );

    return namespaces;
  },

  _getKlassName(type) {
    const modelClass = this._nameToKlass(type);
    const appName = getOwner(this).application.modulePrefix;
    let name = type.name;

    if (appName !== type.modulePrefix) {
      name = `${type.modulePrefix}#${type.name}`;
    }

    if (modelClass) {
      return {
        klass: modelClass,
        name
      }
    }
  },

  _nameToKlass({ modulePrefix, name }) {
    let model, engineName, engineStore;

    let appName = getOwner(this).application.modulePrefix;

    if (modulePrefix !== appName) {
      engineStore = this.get('engineStore').storeFor(modulePrefix);
    }

    if (typeof name === 'string') {
      model = getOwner(this).factoryFor(`model:${name}`);

      if(!model && engineStore) {
        model = engineStore.modelFactoryFor(name);
      } else if(!model) {
        model = this.get('engineStore').lookupFactory(`model:${name}`);
      }
    }

    if (model) {
      return model.class;
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
      model = getOwner(this).factoryFor(`model:${type}`);

      if(!model && engineStore) {
        model = engineStore.modelFactoryFor(modelName);
      }
      else if(!model) {
        model = this.get('engineStore').lookupFactory(`model:${type}`);
      }
    }

    return model.class;
  }
});
