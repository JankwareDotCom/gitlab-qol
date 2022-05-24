import {GetFeatureService} from "./core/FeatureService/FeatureService";
/// DO NOT TOUCH ABOVE THIS LINE

// ADD FEATURE IMPORTS START
import EpicGroupSorting, { AutomaticSort } from "./features/EpicGroupSorting/sortByEpic";
import TwoStepMerge from "./features/EpicGroupSorting/twoStepMerge";
// ADD FEATURE IMPORTS END

/// REGISTER FEATURES IN THIS METHOD
export default function ConfigureFeatures() {
    GetFeatureService()
        .addFeature(new EpicGroupSorting())
        .addFeature(new TwoStepMerge())
}