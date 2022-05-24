export default interface IFeatureOption<TValue = any> {
  GetName(): string;
  GetDescription(): string;
  GetDefaultValue(): TValue;
  IsValidValue(value: TValue): boolean;
}

export abstract class FeatureOption<TValue> implements IFeatureOption {
  readonly Name: string;
  readonly Description: string;
  readonly DefaultValue: TValue;

  constructor(name: string, description: string, defaultValue: TValue) {
    this.Name = name;
    this.Description = description;
    this.DefaultValue = defaultValue;

    if (!this.IsValidValue(defaultValue)) {
      throw new Error(`Invalid Default Value for ${name}`);
    }
  }
  GetName(): string {
    return this.Name;
  }
  GetDescription(): string {
    return this.Description;
  }
  GetDefaultValue() {
    return this.DefaultValue;
  }
  IsValidValue(value: any): value is TValue {
    return true;
  }
}

export abstract class FeatureOptionList<TValue> extends FeatureOption<TValue> {
  readonly Options!: { [Key: string]: TValue };

  constructor(name: string, description: string, defaultValue: TValue, options: { [Key: string]: TValue }) {
    super(name, description, defaultValue);
    this.Options = options;

    Object.keys(options).forEach((e) => {
      const value = options[e];
      if (!this.IsValidValue(value)) {
        throw new Error(`Invalid Feature Option for ${name}:${e}`);
      }
    });
  }
}
