import { GetFeatureService } from '../FeatureService/FeatureService';
import ConfigureFeatures from '../../config';
import FeatureMenu from '../../components/featureMenu/featureMenu';

ConfigureFeatures();
const featureMenu = new FeatureMenu();
featureMenu.initialize(document.getElementById('menuContainer'), GetFeatureService().getFeatures());
