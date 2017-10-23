import { observable, action } from 'mobx';

class Store {
  @observable count = 0;

  @action
  inc() {
    this.count++;
  }

  @action
  dec() {
    this.count--;
  }
}

const store = new Store();
export default store;
