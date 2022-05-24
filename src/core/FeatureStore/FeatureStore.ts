import { GetFeatureKey } from '../../utilities/FeatureKeyUtil';
import { IFeatureStore } from './IFeatureStore';

class FeatureStore implements IFeatureStore {
    async isFlagRegisteredAsync(targetId: string): Promise<boolean> {
        var key = GetFeatureKey(targetId);
        
        var storedResult = await chrome.storage.sync.get([key]);
        var registered = storedResult[key] !== undefined;

        return registered;
    }

    async toggleFlagAsync(targetId: string, value: boolean){
        var key = GetFeatureKey(targetId);
        chrome.storage.sync.set({ [key]: value}, async () =>{
            console.log(`${targetId} (${key}) enabled: ${value}`, await this.isFlagEnabledAsync(targetId));
        });
    }

    async isFlagEnabledAsync(targetId: string) {
        var key = GetFeatureKey(targetId);

        var storedResult = await chrome.storage.sync.get([key]);
        var enabled = Boolean(storedResult[key]).valueOf();
        return enabled;
    }

    async storeOptionAsync(targetId: string, optionKey: string, defaultValue: any, override: boolean = true) {
        var key = GetFeatureKey(`${targetId}:${optionKey}`, "option_");
        
        if (!override){
            const storedResult = await this.getOptionValueAsync(targetId, optionKey);
            if (storedResult !== undefined) {
                console.log(`${targetId}:${optionKey} (${key}) is set to:`, await this.getOptionValueAsync(targetId, optionKey));
                return;
            }
        }
        
        chrome.storage.sync.set({ [key]: defaultValue}, async () => {
            console.log(`${targetId}:${optionKey} (${key}) default set to: ${defaultValue}`, await this.getOptionValueAsync(targetId, optionKey));
        });
    }

    async getOptionValueAsync<TType>(targetId: string, optionKey: string):Promise<TType | null> {
        var key = GetFeatureKey(`${targetId}:${optionKey}`, "option_");
        try {
            var storedResult = await chrome.storage.sync.get([key]);
            return storedResult[key] as TType;
        }
        catch {
            return null;
        }
    }
}

const featureStore = new FeatureStore();
export default featureStore;