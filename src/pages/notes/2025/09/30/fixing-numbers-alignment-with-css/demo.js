import { Base, createApp } from '@studiometa/js-toolkit';
import { Action, DataModel } from '@studiometa/ui';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Action,
      DataModel,
    }
  };
}

createApp(App);
