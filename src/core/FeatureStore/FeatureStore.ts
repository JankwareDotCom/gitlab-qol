import { GetFeatureKey } from '../../utilities/FeatureKeyUtil';
import { IFeatureStore } from './IFeatureStore';

class FeatureStore implements IFeatureStore {
  async isFlagRegisteredAsync(targetId: string): Promise<boolean> {
    const key = GetFeatureKey(targetId);

    const storedResult = await chrome.storage.sync.get([key]);
    const registered = storedResult[key] !== undefined;

    return registered;
  }

  async toggleFlagAsync(targetId: string, value: boolean) {
    const key = GetFeatureKey(targetId);
    chrome.storage.sync.set({ [key]: value }, async () => {
      // eslint-disable-next-line no-console
      console.log(`${targetId} (${key}) enabled: ${value}`, await this.isFlagEnabledAsync(targetId));
    });
  }

  async isFlagEnabledAsync(targetId: string) {
    const key = GetFeatureKey(targetId);

    const storedResult = await chrome.storage.sync.get([key]);
    const enabled = Boolean(storedResult[key]).valueOf();
    return enabled;
  }

  async storeOptionAsync(targetId: string, optionKey: string, defaultValue: any, override = true) {
    const key = GetFeatureKey(`${targetId}:${optionKey}`, 'option_');

    if (!override) {
      const storedResult = await this.getOptionValueAsync(targetId, optionKey);
      if (storedResult !== undefined) {
        // console.log(
        //   `${targetId}:${optionKey} (${key}) is set to:`,
        //   await this.getOptionValueAsync(targetId, optionKey),
        // );
        return;
      }
    }

    chrome.storage.sync.set({ [key]: defaultValue }, async () => {
      // eslint-disable-next-line no-console
      console.log(
        `${targetId}:${optionKey} (${key}) is now set to: ${defaultValue}`,
        await this.getOptionValueAsync(targetId, optionKey),
      );
    });
  }

  async getOptionValueAsync<TType>(targetId: string, optionKey: string): Promise<TType | null> {
    const key = GetFeatureKey(`${targetId}:${optionKey}`, 'option_');
    try {
      const storedResult = await chrome.storage.sync.get([key]);
      return storedResult[key] as TType;
    } catch {
      return null;
    }
  }
}

const featureStore = new FeatureStore();
export default featureStore;
