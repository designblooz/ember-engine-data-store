import { expect } from 'chai';
import { describe, it } from 'ember-mocha';
import <%= classifiedModuleName %> from '<%= dasherizedPackageName %>/models/<%= dasherizedModuleName %>';

describe(
  '<%= friendlyDescription %>',
  {
    // Specify the other units that are required for this test.
    <%= typeof needs !== 'undefined' ? needs : '' %>
  },
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      let model = <%= classifiedModuleName %>.create();
      // var store = this.store();
      expect(model).to.be.ok;
    });
  }
);
