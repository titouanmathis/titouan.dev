import { registerComponents } from '@studiometa/js-toolkit';
import { Action, DataBind, DataComputed, DataModel, DataScope } from '@studiometa/ui';

// DataScope draws the boundary; the Data primitives do the syncing.
// Registering once is enough, the demos below reuse this same set.
registerComponents(DataScope, DataModel, DataBind, DataComputed, Action);
