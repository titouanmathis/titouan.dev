import { Base, createApp, type BaseProps, type BaseConfig } from '@studiometa/js-toolkit';
import { Action, DataModel } from '@studiometa/ui';

interface AppProps extends BaseProps {
  $children: {
    Action: Action[];
    DataModel: DataModel[];
  };
}

class App extends Base<AppProps> {
  static config: BaseConfig = {
    name: 'App',
    components: {
      Action,
      DataModel,
    },
  };
}

createApp(App);
