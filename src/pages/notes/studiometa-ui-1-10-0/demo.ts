import { registerComponents } from '@studiometa/js-toolkit';
import { Action, Toaster, Toast } from '@studiometa/ui';

// The demo shares this one registration. `Toaster` clones its template into a
// `Toast` per notification, so both are registered here.
registerComponents(Action, Toaster, Toast);
