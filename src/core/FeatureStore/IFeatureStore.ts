export interface IFeatureStore {
  toggleFlagAsync(targetId: string, value: boolean): Promise<void>;
  isFlagEnabledAsync(targetId: string): Promise<boolean>;
  isFlagRegisteredAsync(targetId: string): Promise<boolean>;
  storeOptionAsync(targetId: string, optionKey: string, defaultValue: any, override: boolean): Promise<void>;
  getOptionValueAsync<TType>(targetId: string, optionKey: string): Promise<TType | null>;
}
