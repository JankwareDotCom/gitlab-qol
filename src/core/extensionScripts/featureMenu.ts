import { GetFeatureKey } from "../../utilities/FeatureKeyUtil";
import { GetFeatureService } from "../FeatureService/FeatureService";
import featureStore from "../FeatureStore/FeatureStore";
import ConfigureFeatures from "../../config";
import IFeatureOption, { FeatureOption, FeatureOptionList } from "../FeatureOptionService/IFeatureOption";
import AFeature from "../IFeature";

function createRow(table: HTMLTableElement, a:string | HTMLElement, b:string | HTMLElement, c:string | HTMLElement, isHeader: boolean = false) {
    
    let hRow: HTMLTableRowElement;

    if (isHeader) {
        const tHead = table.createTHead();
        hRow = tHead.insertRow();
    } else {
        hRow = table.insertRow();
    }

    var hA = document.createElement(isHeader ? 'th' : 'td')
    var hB = document.createElement(isHeader ? 'th' : 'td')
    var hC = document.createElement(isHeader ? 'th' : 'td')

    hA.style.border = "thin solid black";
    hB.style.border = "thin solid black";
    hC.style.border = "thin solid black";

    hRow.append(hA);
    hRow.append(hB);
    hRow.append(hC);
    hA.append(a);
    hB.append(b);
    hC.append(c);
};

function createOptionRow(featureName:string, table: HTMLTableElement, option: IFeatureOption){
    const nameAndControl = document.createElement("div");
    var key = GetFeatureKey(featureName + ":" + option.GetName(), "option_");
    
    var optTitle = document.createElement("h4");
    optTitle.innerText = option.GetName();
    getOptionElementAsync(featureName, option).then((optionElement) => nameAndControl.append(optTitle, optionElement));
    
    

    createRow(table, '', nameAndControl, option.GetDescription());
}

async function getOptionElementAsync(featureName: string, option: IFeatureOption): Promise<HTMLElement> {
    let res: HTMLElement | null = null;
    
    const updateStore = async (el: HTMLInputElement | HTMLSelectElement | undefined) => {
        
        if (el === undefined){
            return;
        }

        await featureStore.storeOptionAsync(featureName, option.GetName(), el.value, true);
    }   
    
    const curVal = await featureStore.getOptionValueAsync<any>(featureName, option.GetName());
    
    if (option instanceof FeatureOptionList){
        const fol = option as FeatureOptionList<any>;
        const sel = document.createElement('select');
        sel.onchange = () => updateStore(sel);
        sel.style.width = "100%";
            
        Object.keys(fol.Options).forEach(key => {
            const val = fol.Options[key];
            const opt = document.createElement('option');
            opt.value = val;
            opt.innerText = key;
            sel.append(opt);

            if (val === curVal){
                opt.selected = true;
            }
        });

        res = sel;
        
    } 
    else if (option instanceof FeatureOption) {
        const inputElement = document.createElement('input');
        inputElement.onchange = () => updateStore(inputElement);
        switch(typeof option.DefaultValue){
            case 'number':
                inputElement.type = 'number'
                break;
            case 'boolean':
                inputElement.type = 'checkbox'
                break;
            default:
                inputElement.type = 'text';
                break;
        }

        inputElement.value = curVal;
        res = inputElement;
    }

    return res ?? document.createElement('div');
}

ConfigureFeatures();

const container = document.createElement('div');
const featureTable = document.createElement('table');
featureTable.style.borderCollapse = 'collapse'
container.append(featureTable);
createRow(featureTable, "Enabled?", "Feature", "Description", true);

const features = GetFeatureService().getFeatures();

features.forEach(async (e) => {
    
    await _appendFeature(e, featureTable);            
});

async function _appendFeature(e: AFeature, featureTable: HTMLTableElement) {
    const enabledCheckbox = document.createElement("input");
    enabledCheckbox.type = "checkbox";
    const key = GetFeatureKey(e.name);
    enabledCheckbox.id = key;

    enabledCheckbox.onclick = (ev) => {
        featureStore.isFlagEnabledAsync(e.name)
            .then(isEnabled => {
                console.log('ding');

                if (enabledCheckbox.checked != isEnabled){
                    featureStore.toggleFlagAsync(e.name, enabledCheckbox.checked);
                }
            });
    };

    enabledCheckbox.checked = await featureStore.isFlagEnabledAsync(e.name);
    e.options.sort((a,b) => a.GetName().localeCompare(b.GetName()));
    e.options.forEach(async o => await featureStore.storeOptionAsync(e.name, o.GetName(), o.GetDefaultValue(), false));
    createRow(featureTable, enabledCheckbox, e.name, e.description);
    e.options.forEach(o => createOptionRow(e.name, featureTable, o));
    console.log("ab2");
    
}

var body = document.querySelector('body');
console.log(container, body);

document.querySelector("#menuContainer")?.append(container);