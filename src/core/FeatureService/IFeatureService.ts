import IFeature from "../IFeature";

export interface IFeatureService {
    addFeature(feature: IFeature): IFeatureService;
    getFeatures(): IFeature[];
}