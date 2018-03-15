// -----------------------------------
// - Dashboard entry point
// -----------------------------------

import DashSetup from 'js/dash/dashsetup';

// Custom module imports
import BugCtrl from './dash/bug';
import MaintenanceCtrl from './dash/maintenance';
import LowerThirdsCtrl from './dash/lowerThirds';
import SportsCtrl from './dash/sport';

/** A store of controller objects */
let controllers = {
    bug: {
        name: 'Bug',
        controller: BugCtrl
    },
    lowerThirds: {
        name: 'Lower Thirds',
        controller: LowerThirdsCtrl
    },
    sport: {
        name: 'Sports',
        controller: SportsCtrl
    },
    maintenance: {
        name: 'Maintenance',
        controller: MaintenanceCtrl
    }
};

DashSetup(controllers);
