class Menu {
  static buildFromTemplate(tempalte) {
    console.log('mock remote.Menu.buildFromTemplate', tempalte);
    return new Menu();
  }

  popup() {
    console.log('mock remote.Menu.popup');
  }
}

module.exports = {
  remote: {
    require(id) {},
    Menu,
    getCurrentWindow() {
      console.log('mock remote.getCurrentWindow');
    },
  },
};
