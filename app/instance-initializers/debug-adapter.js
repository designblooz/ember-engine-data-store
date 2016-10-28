import DebugAdapter from 'ember-engine-data-store/data-adapters/debug-adapter';

export function initializeDebugAdapter(container) {
  container.register('data-adapter:main', DebugAdapter);
}

export default {
  name: 'data-adapter',
  initialize: initializeDebugAdapter
};
