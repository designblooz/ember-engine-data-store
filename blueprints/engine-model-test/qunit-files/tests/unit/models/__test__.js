import { module, test } from 'ember-qunit';
import <%= classifiedModuleName %> from '<%= dasherizedPackageName %>/models/<%= dasherizedModuleName %>';

module('<%= friendlyDescription %>', {
  // Specify the other units that are required for this test.
<%= typeof needs !== 'undefined' ? needs : '' %>
});

test('it exists', function(assert) {
  let model = <%= classifiedModuleName %>.create();
  // let store = this.store();
  assert.ok(!!model);
});
