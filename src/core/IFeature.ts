import IFeatureOption from "./FeatureOptionService/IFeatureOption";

export interface IFeature {

    name: string;
    description: string;
    options: IFeatureOption[];
    
    canInjectFeature(): boolean;
    injectFeature(): void
}

export default abstract class AFeature implements IFeature{
    abstract name: string;
    abstract description: string;
    options: IFeatureOption<any>[] = [];

    abstract canInjectFeature(): boolean;
    abstract injectFeature(): void
}