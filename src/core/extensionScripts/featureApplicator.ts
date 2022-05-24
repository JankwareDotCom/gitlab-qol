import ConfigureFeatures from '../../config';
import { GetFeatureApplicator } from '../FeatureService/FeatureService';

ConfigureFeatures();
GetFeatureApplicator().applyFeatures();
