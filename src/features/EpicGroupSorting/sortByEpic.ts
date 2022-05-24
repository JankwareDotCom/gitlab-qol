import AFeature from "../../core/IFeature";
import IFeatureOption, {FeatureOptionList } from "../../core/FeatureOptionService/IFeatureOption";
import featureStore from "../../core/FeatureStore/FeatureStore";

class SortOption {
    name: string;
    sortMethod: (epicLaneArr: Element[] , service: EpicGroupSorting) => Promise<Element[]>;

    constructor(name: string, sortMethod: (epicLaneArr: Element[] , service: EpicGroupSorting) => Promise<Element[]>) {
        this.name = name;
        this.sortMethod = sortMethod;
    }
}

let _ogLaneArray:Element[] = [];
export default class EpicGroupSorting extends AFeature{
    _sortOptions: SortOption[] = [];
    _isVisible: boolean = false;
    _issueCountsLoaded = false;

    name = "Epic Group Sorting";
    description = "The ability to sort by Epics when an Issue Board is grouped by Epic";
    
    constructor() {
        super();
        this._sortOptions.push(new SortOption("Default", this._sortByDefault));
        this._sortOptions.push(new SortOption("Title", this._sortByTitle));
        this._sortOptions.push(new SortOption("# of Issues", this._sortByIssueCount));
        this.options.push(new AutomaticSort());
    }

    canInjectFeature(): boolean {
        var loc = window.location.href;
        return loc.includes("/boards/");
    }
    
    injectFeature(): void {
        const filterContainerSelector = "board-swimlanes-toggle-wrapper";
        const featureMenuDiv = document.createElement("div");
        const featureMenuSpanLabel = document.createElement("span");
        const featureMenuDropdown = document.createElement("select");
        
        featureMenuDiv.id = "sortByEpic";
        featureMenuDiv.setAttribute("class", "board-swimlanes-toggle-wrapper gl-md-display-flex gl-align-items-center gl-ml-3");
        
        featureMenuSpanLabel.setAttribute("class", "board-swimlanes-toggle-text gl-white-space-nowrap gl-font-weight-bold gl-line-height-normal");
        featureMenuSpanLabel.innerText = "Sort by";

        featureMenuDropdown.setAttribute("class", "dropdown b-dropdown gl-new-dropdown gl-ml-3");
        featureMenuDropdown.onchange = () => {
            const sortMethod = this._sortOptions.find(f=>f.name === featureMenuDropdown.value);
            
            if (sortMethod === undefined){
                return;
            }

            this._applySort(sortMethod.sortMethod, this, false);
        }
        
        this._sortOptions.forEach(opt => {
            const dropdownOption = document.createElement("option");
            dropdownOption.innerHTML = opt.name;
            featureMenuDropdown.append(dropdownOption);
        })

        featureMenuDiv.append(featureMenuSpanLabel);
        featureMenuDiv.append(featureMenuDropdown);

        let iteration = 0;
        const injectTimeout = 30;
        var checker = setInterval(() => 
            {
                var menuTargets = document.getElementsByClassName(filterContainerSelector);
                var menuTarget = menuTargets[0];
                let hasLanes = false;

                try {
                    _ogLaneArray = this._getEpicLanes(this._getEpicLaneContainer());
                    console.log(_ogLaneArray);
                    clearInterval(checker);
                    hasLanes = true;
                }
                catch {
                    // we will continue waiting for N seconds
                    iteration++;
                    if (iteration > 10 * injectTimeout) {
                        clearInterval();
                    }
                }

                if (menuTarget !== null && menuTarget !== undefined && hasLanes) {
                    clearInterval(checker);
                    this._addGroupByListener();
                    menuTarget.append(featureMenuDiv);
                    this._applyFeatureOptions();
                }
            }, 100);
    }
    
    _applyFeatureOptions() {
        if (this.options === undefined){
            return;
        }        
        this._applyAutomaticSort();
    }

    _applyAutomaticSort() {
        featureStore.getOptionValueAsync<string>(this.name, "Automatic Sort")
            .then(val => {
                var selectBox = this._getSortByEpicSelectElement();

                if (selectBox === null){
                    return;
                }

                selectBox.value = val ?? "Default";
                selectBox.dispatchEvent(new Event('change'));                
            })
    }

    _addGroupByListener(): void {
        const setVisibility = () => this._isVisible = window.location.href.indexOf('group_by=epic') > -1;
        let lastUrl = window.location.href;
        
        var observer = new MutationObserver(() => {
            if (lastUrl != document.location.href){
                lastUrl = window.location.href;
            }

            setVisibility();
            
            var sbeSelect = this._getSortByEpicSelectElement();

            if (sbeSelect == null) {
                return;
            }

            if (!this._isVisible){
                sbeSelect.selectedIndex = 0;   
            }

            var sbe = this._getSortByEpicDiv();
            if (sbe !== null){
                sbe.style.display = this._isVisible ? '' : 'none';        
            }
        });

        observer.observe(document.body, {childList: true, subtree: true});
        
        setVisibility();
    }

    _getSortByEpicDiv() : HTMLElement | null {
        var sbe = document.getElementById("sortByEpic");       

        return sbe;
    }

    _getSortByEpicSelectElement() : HTMLSelectElement | null {
            
            var sbe = this._getSortByEpicDiv();
            
            if (sbe === null) {
                return null;
            }

            var sbeSelect = sbe.querySelector('select');

            if (sbeSelect == null) {
                return null;
            }

            return sbeSelect;
    }

    _getEpicLaneContainer(): Element {
        const epicLaneSelectorClass = 'board-epics-swimlanes';
        const epicLaneQuerySelector = 'div[role="group"]'; 
        
        var epicLaneContainer = document
            .getElementsByClassName(epicLaneSelectorClass)[0]
            .querySelector(epicLaneQuerySelector);

        if (epicLaneContainer === undefined || epicLaneContainer === null){
            throw new Error("Epic grouping not found");
        }
        
        return epicLaneContainer;
    }

    _getEpicLanes(epicLaneContainer: Element): Element[] {
        const singleLaneSelectorClass = 'board-epic-lane-container';
        var epicLanes = epicLaneContainer.getElementsByClassName(singleLaneSelectorClass);

        if (epicLanes === undefined || epicLanes.length == 0) {
            throw new Error("Epic lanes not found");
        }

        var epicLaneArr = Array<Element>().slice.call(epicLanes);
        return epicLaneArr;
    }

    _applySort(sortMethod: (epicLaneArr: Element[], service: EpicGroupSorting) => Promise<Element[]>, service: EpicGroupSorting, inverse: boolean) {
        const epicLaneContainer = this._getEpicLaneContainer();
        const epicLaneArr = this._getEpicLanes(epicLaneContainer);

        sortMethod(epicLaneArr, service).then(sortedLanes => {
            if (inverse){
                sortedLanes.reverse();
            }

            epicLaneContainer.innerHTML = "";
            
            sortedLanes.forEach(element => {
                epicLaneContainer.append(element);    
            });
        });
    }

    _sortByDefault(epicLaneArr: Element[], service: EpicGroupSorting): Promise<Element[]> {
        epicLaneArr = _ogLaneArray;
        return new Promise((resolve) => resolve(epicLaneArr));
    }

    _sortByTitle(epicLaneArr: Element[],  service: EpicGroupSorting): Promise<Element[]> {
        const singleLaneTitleSelector = 'div div h4';                       
        var sorted = epicLaneArr.sort((a, b) => {
            return (a.querySelector(singleLaneTitleSelector)?.innerHTML.toLowerCase() ?? "")
                    .localeCompare(b.querySelector(singleLaneTitleSelector)?.innerHTML.toLowerCase() ?? "");
        });

        return new Promise((resolve) => resolve(sorted));
    }

    async _sortByIssueCount(epicLaneArr: Element[], service: EpicGroupSorting): Promise<Element[]> {
        const singleLaneIssueSelector = 'div div span span';                       

        if (!service._issueCountsLoaded) {
            var readyInt = setInterval(() => {
                let lane = 0;
                let localReady = true;
                epicLaneArr.forEach(e => {
                    const issueSelector = e.querySelector(singleLaneIssueSelector);
                    var issueCount = parseInt(issueSelector?.innerHTML ?? "");
                    if (issueSelector === undefined || isNaN(issueCount)) {
                        localReady = false;
                    }
                })
    
                if (localReady){
                    clearInterval(readyInt);
                    service._issueCountsLoaded = true;

                    var selectBox = service._getSortByEpicSelectElement();

                    if (selectBox === null){
                        return;
                    }

                    selectBox.dispatchEvent(new Event('change')); 
                }
            }, 500);
        }

        var sorted = epicLaneArr.sort((a, b) => {
            return (a.querySelector(singleLaneIssueSelector)?.innerHTML.toLowerCase() ?? "")
                    .localeCompare(b.querySelector(singleLaneIssueSelector)?.innerHTML.toLowerCase() ?? "", 
                        undefined, { numeric: true, sensitivity: 'base'});
        });

        return sorted;
    }
}

export class AutomaticSort extends FeatureOptionList<string>{    
    constructor() {
        super(
            "Automatic Sort",
            "Automatically Sort using the defined method when board loads",
            "Default",
            {
                "Default": "Default",
                "Title": "Title",
                "# of Issues": "# of Issues"
            }
        );
    }
}
