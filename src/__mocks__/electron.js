const electron = jest.genMockFromModule();

electron.remote = {
  require: id => require(id),
};

module.exports = electron;
