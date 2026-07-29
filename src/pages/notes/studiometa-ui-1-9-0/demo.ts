import { registerComponents } from '@studiometa/js-toolkit';
import { Action, Carousel, Dialog, Transition, ViewTransition } from '@studiometa/ui';

// Every demo on the page shares this one registration; each snippet only uses
// the components it needs. Carousel pulls in its own CarouselWrapper /
// CarouselItem / CarouselBtn / CarouselDrag children on its own.
registerComponents(Action, Dialog, Transition, ViewTransition, Carousel);
