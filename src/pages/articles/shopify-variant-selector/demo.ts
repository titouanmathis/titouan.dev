import { registerComponents } from '@studiometa/js-toolkit';
import { DataBind, DataComputed, DataEffect, DataModel, DataScope } from '@studiometa/ui';

// The Data family is pure client-side reactivity: no network here. The radios
// are the source (DataModel); the price (DataComputed), the label (DataBind)
// and the buy button (DataEffect) all react to the selected size. On a real
// store you feed these from product.variants or the Section Rendering API
// (see "The real wiring" in the article).
registerComponents(DataScope, DataModel, DataComputed, DataBind, DataEffect);
