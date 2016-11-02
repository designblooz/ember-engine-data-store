/*jshint node:true*/

module.exports = {
  description: 'Create engine model',
  locals(options) {
    const modelBlueprint = this.lookupBlueprint('model');
    return modelBlueprint.locals(options);
  }
};
