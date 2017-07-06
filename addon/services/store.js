import Ember from 'ember';
import DS from 'ember-data';

const { computed, getOwner, inject, isPresent } = Ember;

export default DS.Store.extend({
  engineStore: inject.service(),
  init() {
    this._super(...arguments);
    this.set('engineName', getOwner(this).base.modulePrefix);
  },
  modelFor(modelName) {
    let factory = this.get('engineStore').modelFactoryFor(modelName);

    if(factory) {
      factory.class.modelName = factory.class.modelName || modelName;
    }
    return factory.class;
  },
  buildInternalModel(type, id, data) {
    let engine = type ? this._splitKlassAndFindStore(type) : null;

    if(engine && engine.modulePrefix !== this.get('engineName') && engine.store) {
      let idToRecord = engine.store.typeMapFor(type, id).idToRecord;
      let record = idToRecord[id];

      if(!record) {
        return engine.store.buildInternalModel(type, id, data);
      }

      return record;
    }

    return this._super(...arguments);
  },
  _hasModelFor(modelName) {
    return this.get('engineStore').modelFactoryFor(modelName);
  },
  _findByInternalModel(internalModel, options) {
    let engine = this._splitKlassAndFindStore(internalModel.type);

    if(engine.modulePrefix !== this.get('engineName') && engine.store) {
      return engine.store._findByInternalModel(internalModel, options);
    }

    return this._super(...arguments);
  },
  _splitKlassAndFindStore(klass) {
    let typeSplit = klass.toString().split('@');
    let modulePrefix = typeSplit.shift();
    let factoryName = typeSplit.pop();
    let store = this.get('engineStore').storeFor(modulePrefix);

    return {
      modulePrefix,
      factoryName,
      store
    }
  }
});
