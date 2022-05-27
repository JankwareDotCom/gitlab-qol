import IFeatureOption, { FeatureOption, FeatureOptionList } from '../../core/FeatureOptionService/IFeatureOption';
import featureStore from '../../core/FeatureStore/FeatureStore';
import AFeature from '../../core/IFeature';
import Define, { CustomHTMLElement } from '../../utilities/CustomElementHelper';
import { GetFeatureKey } from '../../utilities/FeatureKeyUtil';
import { Accordian } from '../accordian/accordian';

export class FeatureHeader extends CustomHTMLElement {
  headerText = document.createElement('strong');
  enabledCheckbox = document.createElement('input');
  featureName!: string;

  async initialize(e: AFeature): Promise<void> {
    this.featureName = e.name;
    this.append(this.enabledCheckbox, this.headerText);
    const key = GetFeatureKey(this.featureName);
    this.id = key;
    this.headerText.innerText = this.featureName;
    this.style.display = 'flex';
    this.enabledCheckbox.type = 'checkbox';
    this.enabledCheckbox.id = key;
    this.enabledCheckbox.onclick = (clickEvent) => {
      clickEvent.stopPropagation();
      featureStore.isFlagEnabledAsync(this.featureName).then((isEnabled) => {
        if (this.enabledCheckbox.checked != isEnabled) {
          featureStore.toggleFlagAsync(this.featureName, this.enabledCheckbox.checked);
        }
      });
    };
    this.enabledCheckbox.checked = await featureStore.isFlagEnabledAsync(this.featureName);
  }
}

export class FeatureBody extends CustomHTMLElement {
  descriptionParagraph = document.createElement('p');
  optionContainer = document.createElement('div');

  async initialize(e: AFeature): Promise<void> {
    this.descriptionParagraph.style.fontStyle = 'italic';
    this.descriptionParagraph.innerText = e.description;
    this.append(this.descriptionParagraph);

    if (e.options.length > 0) {
      this.append(this.optionContainer);

      e.options.forEach(async (opt) => {
        const option = new FeatureOptionContainer();
        await option.initialize(e.name, opt);
        this.optionContainer.append(option);
      });

      this.append(document.createElement('br'));
    }
  }
}

export class FeatureOptionContainer extends CustomHTMLElement {
  fieldset = document.createElement('fieldset');

  async initialize(featureName: string, option: IFeatureOption): Promise<void> {
    const legend = document.createElement('legend');
    const descriptionParagraph = document.createElement('p');
    const optionControl = new FeatureOptionControl();
    descriptionParagraph.style.fontSize = 'smaller';
    descriptionParagraph.style.fontSize = 'italic';
    descriptionParagraph.innerText = option.GetDescription();
    legend.innerText = option.GetName();
    await optionControl.initialize(featureName, option);
    this.append(this.fieldset);
    this.fieldset.append(legend);
    this.fieldset.append(descriptionParagraph);
    this.fieldset.append(optionControl);
  }
}

export class FeatureOptionControl extends CustomHTMLElement {
  controlElement: HTMLInputElement | HTMLSelectElement = document.createElement('input');
  featureName!: string;
  option!: IFeatureOption;

  async initialize(featureName: string, option: IFeatureOption): Promise<void> {
    this.featureName = featureName;
    this.option = option;
    await this.buildControl();
  }

  async updateStore(el: HTMLInputElement | HTMLSelectElement | undefined) {
    if (el === undefined) {
      return;
    }

    await featureStore.storeOptionAsync(this.featureName, this.option.GetName(), el.value, true);
  }

  async buildControl() {
    const curVal = await featureStore.getOptionValueAsync<any>(this.featureName, this.option.GetName());
    if (this.option instanceof FeatureOptionList) {
      const fol = this.option as FeatureOptionList<any>;
      const sel = document.createElement('select');

      Object.keys(fol.Options).forEach((key) => {
        const val = fol.Options[key];
        const opt = document.createElement('option');
        opt.value = val;
        opt.innerText = key;
        sel.append(opt);

        if (val === curVal) {
          opt.selected = true;
        }
      });

      this.controlElement = sel;
    } else if (this.option instanceof FeatureOption) {
      const inputElement = document.createElement('input');
      switch (typeof this.option.DefaultValue) {
        case 'number':
          inputElement.type = 'number';
          break;
        case 'boolean':
          inputElement.type = 'checkbox';
          break;
        default:
          inputElement.type = 'text';
          break;
      }
      this.controlElement = inputElement;
    }

    this.controlElement.style.width = '100%';
    this.controlElement.onchange = () => this.updateStore(this.controlElement);
    this.controlElement.value = curVal;

    this.append(this.controlElement);
  }
}

export default class FeatureMenu extends CustomHTMLElement {
  newMenu = new Accordian();
  menuOptions: { title: string | HTMLElement; content: string | HTMLElement }[] = [];

  initialize(appendTo: HTMLElement | null, features: AFeature[]): void {
    this.append(this.newMenu);
    this.populateMenuOptions(features).then(() => {
      this.newMenu.initialize(this.menuOptions, { AllowMultipleExpansion: false });
    });
    appendTo?.append(this);
  }

  async populateMenuOptions(features: AFeature[]): Promise<void> {
    let populatedCount = 0;
    let populateWait: any;

    return new Promise((resolve) => {
      features.forEach((e) => {
        const header = new FeatureHeader();
        const body = new FeatureBody();
        header
          .initialize(e)
          .then(() => {
            body.initialize(e);
          })
          .finally(() => {
            this.menuOptions.push({
              title: header,
              content: body,
            });
            populatedCount++;
          });
      });
      populateWait = setInterval(() => {
        if (populatedCount === features.length) {
          clearInterval(populateWait);
          resolve();
        }
      }, 100);
    });
  }
}

Define('feature-header', FeatureHeader);
Define('feature-body', FeatureBody);
Define('feature-option-container', FeatureOptionContainer);
Define('feature-option-control', FeatureOptionControl);
Define('feature-menu', FeatureMenu);
