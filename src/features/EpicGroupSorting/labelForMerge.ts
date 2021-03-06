import AFeature from '../../core/IFeature';
import featureStore from '../../core/FeatureStore/FeatureStore';
import { FeatureOption, FeatureOptionList } from '../../core/FeatureOptionService/IFeatureOption';

export default class LabelForMerge extends AFeature {
  name = 'Disable Merge Without Label';
  description = 'Disable the Merge button until a specified label configuration is present';

  _labelCache = { timestamp: new Date(), labels: Array<string>(), mode: 'ANY' };

  constructor() {
    super();
    this.options.push(new MergeLabelOption(), new MergeMultiLabelOptionBehavior());
  }

  canInjectFeature(): boolean {
    const loc = window.location.href;
    return loc.includes('/merge_requests/');
  }

  injectFeature(): void {
    const feature = setInterval(() => {
      this._canShowButtonAsync().then((canShow) => {
        Array<HTMLButtonElement>()
          .slice.call(document.getElementsByClassName('accept-merge-request'))
          .forEach((e) => {
            e.disabled = !canShow;
          });
      });
    }, 1000);

    window.onbeforeunload = () => clearInterval(feature);
  }

  async _canShowButtonAsync(): Promise<boolean> {
    const labelContainer = document.getElementsByClassName('labels-select-wrapper')[0];
    let labelElements = Array<HTMLSpanElement>().slice.call(
      labelContainer.getElementsByClassName('gl-label-text-scoped'),
    );
    labelElements = labelElements.concat(
      Array<HTMLSpanElement>().slice.call(labelContainer.getElementsByClassName('gl-label-text')),
    );

    const unique = (value: string, index: number, self: string[]) => {
      return self.indexOf(value) === index;
    };

    const labels = labelElements.map((m) => m.innerText.trim()).filter(unique);

    const desiredLabelSettings = await this._getDesiredLabelSettings();
    const desiredLabels = desiredLabelSettings.labels.filter(unique);

    const label = desiredLabels.filter((v) => labels.includes(v));

    return desiredLabelSettings.mode === 'ANY' ? label.length > 0 : label.length === desiredLabels.length;
  }

  async _getDesiredLabelSettings() {
    const maxAgeMinutes = 1;
    const maxTs = new Date(new Date().getTime() - 60 * maxAgeMinutes * 1000); // - N Minutes

    if (this._labelCache.labels.length > 0 && this._labelCache.timestamp >= maxTs) {
      return this._labelCache;
    }

    const desiredLabelCsv = (await featureStore.getOptionValueAsync<string>(this.name, 'Label Text')) ?? '';
    const desiredLabels = desiredLabelCsv.split(',').map((m) => m.trim());

    this._labelCache.labels = desiredLabels;
    this._labelCache.timestamp = new Date();
    this._labelCache.mode =
      (await featureStore.getOptionValueAsync<string>(this.name, 'Multi-Label Behavior')) ?? 'ANY';
    return this._labelCache;
  }
}

class MergeLabelOption extends FeatureOption<string> {
  constructor() {
    super(
      'Label Text',
      '[CASE SENSITIVE] Merge requests without any of the following (comma-separated) labels will have the merge button disabled.',
      '',
    );
  }
}

class MergeMultiLabelOptionBehavior extends FeatureOptionList<string> {
  constructor() {
    super('Multi-Label Behavior', 'Determines if ANY or ALL of the lables are required to merge', 'ANY', {
      ANY: 'ANY',
      ALL: 'ALL',
    });
  }
}
