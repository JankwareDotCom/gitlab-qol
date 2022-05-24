import IFeature from "../IFeature";
import { IFeatureService } from "./IFeatureService";
import featureStore from "../FeatureStore/FeatureStore";
import IFeatureApplicator from "../IFeatureApplicator";

class FeatureService implements IFeatureService, IFeatureApplicator {
    _features: IFeature[] = [];

    addFeature(feature: IFeature): IFeatureService {
        if (!this._features.find(f => f.name === feature.name)){
            this._features.push(feature);
        }

        featureStore.isFlagRegisteredAsync(feature.name)
        .then(async (isRegistered) => {
            console.log(feature.name + " is new reg?:", isRegistered)
            if (!isRegistered) {
                console.log('dong');
                await featureStore.toggleFlagAsync(feature.name, true);
            }
        });

        return this;
    }

    applyFeatures(): void {
        this._features.forEach(async (feat) => {
            const isEnabled = await featureStore.isFlagEnabledAsync(feat.name);
            const canInject = feat.canInjectFeature();

            console.log(`Feature ${feat.name}: isEnabled? ${isEnabled}; canInject: ${canInject}`);

            if (isEnabled && canInject){
                feat.injectFeature();
            }
        });
    }

    getFeatures(): IFeature[] {
        return this._features;
    }
}
const _fs: FeatureService = new FeatureService();

export function GetFeatureService(): IFeatureService {return _fs};
export function GetFeatureApplicator(): IFeatureApplicator {return _fs;}