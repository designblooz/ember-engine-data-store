/*jshint node:true*/

const ModelBlueprint = require('../engine-model');
const testInfo = require('ember-cli-test-info');
const useTestFrameworkDetector = require('ember-data/blueprints/test-framework-detector');

module.exports = useTestFrameworkDetector({
  description: 'Generates a model unit test.',

  locals: function(options) {
    let result = ModelBlueprint.locals.apply(this, arguments);

    result.friendlyDescription = testInfo.description(options.entity.name, "Unit", "Model");

    return result;
  }
});
