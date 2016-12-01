import Ember from 'ember';
import { assert, warn } from "ember-data/-private/debug";

const { computed, get, getOwner, isPresent, isBlank, inject } = Ember;

let routeHandlerCalled = Ember.Object.create();

export default class EngineStore extends Ember.Service {
  init() {
    let target = getOwner(this);
    this.set('router', target.lookup('router:main'));

    let engineInfoByRoute = this.get('router._engineInfoByRoute') || this.get('router._routeToEngineInfoXRef');
    let handler = this.get('router')._getHandlerFunction();

    Object.keys(engineInfoByRoute).forEach((routeName)=> {
      if (!routeName.includes('.') && !routeHandlerCalled.get(routeName)) {
        routeHandlerCalled.set(routeName, true);
        handler(routeName);
      }
    });
  }

  get store() {
    return inject.service('store');
  }

  get routerEngineInstances() {
    return computed.alias('router._engineInstances');
  }
  get routerEngineInstancesCount() {
    return Object.keys(this.get('routerEngineInstances')).length;
  }

  get engineInstances() {
    if (this.get('router._engineInstances')) {
      return Object.keys(this.get('router._engineInstances')).map((engineKey)=> {
        let engineObject = get(this.get('router._engineInstances'), engineKey);
        let engine;

        Object.keys(engineObject).forEach((key)=> {
          engine = get(engineObject, key);
        });

        return engine;
      });
    }
    return [];
  }

  get engineStores() {
    return this.get('engineInstances').map((engine)=> {
      return engine.lookup('service:store');
    });
  }

  /**
   * @method storeFor
   * @param  {String} engineName
   * @return {DS.Store}
   */
  storeFor(engineName = '') {
    return this.get('engineStores').find((store)=> {
      let engine = getOwner(store);
      return engine.get('base.modulePrefix') === engineName;
    });
  }

  /**
   * `adapterFor('user')`
   * will traverse through all available engine store and
   * invoke `adapterFor('user')` on all available engine store until returned response is found
   *
   * `adapterFor('user-engine#user')`
   * will invoke `adapterFor('user')` on `user-engine` store
   */
  adapterFor(modelName = '') {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'adapterFor', [modelName]);
    }

    return this._invokeMethodFromEngineStores('adapterFor', [modelName]);
  }

  /**
   * `createRecord('user')`
   * will traverse through all available engine store and
   * invoke createRecord with passed arguments
   *
   * `createRecord('user-engine#user')`
   * will invoke `createRecord('user')` on `user-engine` store
   */
  createRecord(modelName = '', inputProperties = {}) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'createRecord', [modelName[1], inputProperties]);
    }

    return this._invokeMethodFromEngineStores('createRecord', [modelName, inputProperties]);
  }

  /**
   * `findAll('user')`
   * will traverse through all available engine store and
   * invoke `findAll('user')` on all available engine store until returned response is found
   *
   * `findAll('user-engine#user')`
   * will invoke `findAll('user')` on `user-engine` store
   */
  findAll(modelName = '', options = {}) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'findAll', [modelName[1], options]);
    }

    return this._invokeMethodFromEngineStores('findAll', [modelName, options]);
  }

  /**
   * `findRecord('user', 1)`
   * will traverse through all available engine store and
   * invoke `findRecord('user', 1)` on all available engine store until returned response is found
   *
   * `findRecord('user-engine#user', 1)`
   * will call `findRecord('user', 1)` on `user-engine` store
   */
  findRecord(modelName = '', id, options = {}) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'findRecord', [modelName[1], id, options]);
    }

    return this._invokeMethodFromEngineStores('findRecord', [modelName, id, options]);
  }

  /**
   * `getReference('user', 1)`
   * will traverse through all available engine store and
   * invoke `getReference('user', 1)` on all available engine store until returned response is found
   *
   * `getReference('user-engine#user', 1)`
   * will call `getReference('user', 1)` on `user-engine` store
   */
  getReference(type = '', id) {
    if (type.includes('#')) {
      type = type.split('#');
      return this._invokeMethodFromEngineStore(type[0], 'getReference', [type[1], id])
    }

    return this._invokeMethodFromEngineStores('getReference', [type, id]);
  }

  /**
   * `hasRecordForId('user', 1)`
   * will traverse through all available engine store and
   * invoke `hasRecordForId('user', 1)` on all available engine store until returned response is found
   *
   * `hasRecordForId('user-engine#user', 1)`
   * will call `hasRecordForId('user', 1)` on `user-engine` store
   */
  hasRecordForId(modelName = '', inputId) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'hasRecordForId', [modelName[1], inputId])
    }

    return this._invokeMethodFromEngineStores('hasRecordForId', [modelName, inputId]);
  }

  /**
   * `modelFor('user')`
   * will traverse through all available engine store and
   * invoke `modelFor('user')` on all available engine store until returned response is found
   *
   * `modelFor('user-engine#user')`
   * will invoke `modelFor('user')` on `user-engine` store
   */
  modelFor(modelName = '') {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'modelFor', [modelName[1]]);
    }

    return this._invokeMethodFromEngineStores('modelFactoryFor', [modelName]);
  }

  /**
   * `modelFactoryFor('user')`
   * will traverse through all available engine store and
   * invoke `modelFactoryFor('user')` on all available engine store until returned response is found
   *
   * `modelFactoryFor('user-engine#user')`
   * will invoke `modelFactoryFor('user')` on `user-engine` store
   */
  modelFactoryFor(modelName = '') {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'modelFactoryFor', [modelName[1]]);
    }

    return this._invokeMethodFromEngineStores('modelFactoryFor', [modelName]);
  }

  /**
   * `normalize('user', {...})`
   * will traverse through all available engine store and
   * invoke `normalize('user', {...})` on all available engine store until returned response is found
   *
   * `normalize('user-engine#user', {...})`
   * will call `normalize('user', {...})` on `user-engine` store
   */
  normalize(modelName = '', payload) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'normalize', [modelName[1], payload])
    }

    return this._invokeMethodFromEngineStores('normalize', [modelName, payload]);
  }

  /**
   * `peekAll('user')`
   * will traverse through all available engine store and
   * invoke `peekAll('user')` on all available engine store until returned response is found
   *
   * `peekAll('user-engine#user')`
   * will call `peekAll('user')` on `user-engine` store
   */
  peekAll(modelName = '') {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'peekAll', [modelName[1]])
    }

    return this._invokeMethodFromEngineStores('peekAll', [modelName]);
  }

  /**
   * `peekRecord('user', 1)`
   * will traverse through all available engine store and
   * invoke `peekRecord('user', 1)` on all available engine store until returned response is found
   *
   * `peekRecord('user-engine#user', 1)`
   * will call `peekRecord('user', 1)` on `user-engine` store
   */
  peekRecord(modelName = '', id) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'peekRecord', [modelName[1], id])
    }

    return this._invokeMethodFromEngineStores('peekRecord', [modelName, id]);
  }

  /**
   * `push('user-engine', {...})`
   * will call `push({...})` on `user-engine` store
   */
  push(engineName, data) {
    return this._invokeMethodFromEngineStore(engineName, 'push', [data]);
  }

  /**
   * `pushPayload('user', {...})`
   * will find store with `user` model defined and
   * invoke `pushPayload('user', {...})`
   *
   * `pushPayload('user-engine#user', {...})`
   * will call `pushPayload('user', {...})` on `user-engine` store
   */
  pushPayload(modelName, inputPayload) {
    let model = this.modelFor(modelName);

    assert(`Could not find model named ${modelName}`, isPresent(model));

    modelName = isPresent(model) ? model.toString() : null;

    if (modelName) {
      modelName = modelName.split('@');
      return this._invokeMethodFromEngineStore(modelName[0], 'pushPayload', [modelName[1], inputPayload]);
    }
  }

  /**
   * `query('user', {...})`
   * will traverse through all available engine store and
   * invoke `query('user', {...})` on all available engine store until returned response is found
   *
   * `query('user-engine#user', {...})`
   * will call `query('user', {...})` on `user-engine` store
   */
  query(modelName = '', query) {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'query', [modelName[1], query])
    }

    return this._invokeMethodFromEngineStores('query', [modelName, query]);
  }

  /**
   * `queryRecord('user', {...})`
   * will traverse through all available engine store and
   * invoke `queryRecord('user', {...})` on all available engine store until returned response is found
   *
   * `queryRecord('user-engine#user', {...})`
   * will call `queryRecord('user', {...})` on `user-engine` store
   */
  queryRecord(modelName = '', query)  {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'queryRecord', [modelName[1], query])
    }

    return this._invokeMethodFromEngineStores('queryRecord', [modelName, query]);
  }

  /**
   * `recordIsLoaded('user', 1)`
   * will traverse through all available engine store and
   * invoke `recordIsLoaded('user', 1)` on all available engine store until returned response is found
   *
   * `recordIsLoaded('user-engine#user', 1)`
   * will call `recordIsLoaded('user', 1)` on `user-engine` store
   */
  recordIsLoaded(modelName = '', id)  {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'recordIsLoaded', [modelName[1], id])
    }

    return this._invokeMethodFromEngineStores('recordIsLoaded', [modelName, id]);
  }

  /**
   * `serializerFor('user', 1)`
   * will traverse through all available engine store and
   * invoke `serializerFor('user', 1)` on all available engine store until returned response is found
   *
   * `serializerFor('user-engine#user', 1)`
   * will call `serializerFor('user', 1)` on `user-engine` store
   */
  serializerFor(modelName = '')  {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'serializerFor', [modelName[1]])
    }

    return this._invokeMethodFromEngineStores('serializerFor', [modelName]);
  }

  /**
   * `unloadAll('user')`
   * will traverse through all available engine store and
   * invoke `unloadAll('user')` on all available engine store until returned response is found
   *
   * `unloadAll('user-engine#user')`
   * will call `unloadAll('user')` on `user-engine` store
   */
  unloadAll(modelName = '')  {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'unloadAll', [modelName[1]])
    }

    return this._invokeMethodFromEngineStores('unloadAll', [modelName]);
  }

  /**
   * `unloadAll('user')`
   * will traverse through all available engine store and
   * invoke `unloadAll('user')` on all available engine store until returned response is found
   *
   * `unloadAll('user-engine#user')`
   * will call `unloadAll('user')` on `user-engine` store
   */
  unloadAll(modelName = '')  {
    if (modelName.includes('#')) {
      modelName = modelName.split('#');
      return this._invokeMethodFromEngineStore(modelName[0], 'unloadAll', [modelName[1]])
    }

    return this._invokeMethodFromEngineStores('unloadAll', [modelName]);
  }

  lookupFactory(factoryName) {
    return this._lookupFactoryFromEngines(factoryName);
  }

  /**
   * Private
   */
  _invokeMethodFromEngineStore(engineName, methodName, args) {
    let engineStore = this.storeFor(engineName);
    assert(`Store for "${engineName}" does not exist`, isPresent(engineStore));

    if (isPresent(engineStore) && engineStore[methodName]) {
      return engineStore[methodName].apply(engineStore, args);
    }
  }
  _invokeMethodFromEngineStores(methodName, args) {
    let returned;

    this.get('engineStores').forEach((engineStore)=> {
      if (!returned && engineStore[methodName]) {
        returned = engineStore[methodName].apply(engineStore, args);
      }
    });

    // Try main application store for fallback
    if (!returned && this.get(`store.${methodName}`)) {
      returned = this.get(`store.${methodName}`).apply(this.get('store'), args);
    }

    return returned;
  }
  _lookupFactoryFromEngine(factoryName, engineName) {
    let engine = this.get('engineInstances').findBy('name', engineName);
    return engine._lookupFactory(factoryName);
  }
  _lookupFactoryFromEngines(factoryName) {
    let factory;

    this.get('engineInstances').forEach((engineInstance)=> {
      if(!factory) {
        factory = engineInstance._lookupFactory(factoryName);
      }
    });

    return factory;
  }
}
