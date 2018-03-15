// -----------------------------------
// - Character generator entry point
// -----------------------------------

import CgSetup from 'js/cg/cgsetup';

// Custom module imports
import BugCtrl from './cg/bug';
import LowerThirdsCtrl from './cg/lowerThirds';
import SportsCtrl from './cg/sport';

/** A store of controller objects */
let controllers = {
    bug: BugCtrl,
    lowerThirds: LowerThirdsCtrl,
    sport: SportsCtrl
};

CgSetup(controllers);
