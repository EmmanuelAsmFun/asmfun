import { AsmTools, AsmString } from "../../Tools.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { INavItem, INavItemUICollection, INavUIItem } from "./data/INavItemCollection.js";

export class NavCollection<TItem extends INavItem<TUIItem>, TUIItem extends INavUIItem>   {

    private items: TItem[] = [];
    private Ui: INavItemUICollection<TUIItem> = { // tempery create 
            List: [],
            Search: "",
            SearchChanged: () => { }
    };

    public SetUIData(uiData: INavItemUICollection<TUIItem>) {
        this.Ui = uiData;
        this.Ui.List = [];
        for (var i = 0; i < this.items.length; i++)
            this.Ui.List.push(this.items[i].Ui);
        this.Ui.SearchChanged = () => {
            var search = AsmString.CleanSearch(this.Ui.Search);
            this.Ui.List = this.items.filter(x => AsmString.CompareInsensitive(x.Ui.Name, search)).map(x => x.Ui);
        }
    }

    public Reset() {
        this.items = [];
        this.Ui.List = [];
    }

    public Add(label: TItem) {
        this.items.push(label);
        this.Ui.List.push(label.Ui);
    }

    public ParseAddress(name: string, addressNum: number) {
        var labelIndex = this.items.findIndex(x => x.Ui.Name === name);
        if (labelIndex < 0) return;
        var label = this.items[labelIndex];
        label.AddressNum = addressNum;
        label.Ui.Address = AsmTools.numToHex5(addressNum);

    }

    public AddUsedBy(label: TItem, lineI: InterpreterLine) {
        if (label.UsedByLines.indexOf(lineI) > -1) 
            return;
        label.UsedByLines.push(lineI);
        label.Ui.UsedByLines.push({
            FileIndex: lineI.Ui.FileIndex,
            LineNumber: lineI.LineNumber,
            Text: lineI.EditorLine.data.sourceCode.split(";")[0].trim()
        });
    }

    public Remove(label: TItem, onRemovedLink: (item: InterpreterLine) => void) {
        var labelIndex = this.items.findIndex(x => x === label);
        if (labelIndex > -1) this.items.splice(labelIndex, 1);
        labelIndex = this.Ui.List.findIndex(x => x === label.Ui);
        if (labelIndex > -1) this.Ui.List.splice(labelIndex, 1);
        for (var i = 0; i < label.UsedByLines.length; i++)
            onRemovedLink(label.UsedByLines[i]);
            //label.UsedByLines[i].LabelLink = null;
        label.UsedByLines = [];
        label.Ui.UsedByLines = [];
    }

    public RemoveByName(name: string, onRemovedLink: (item: InterpreterLine) => void) {
        var labelIndex = this.items.findIndex(x => x.Ui.Name === name);
        if (labelIndex > -1)
            this.Remove(this.items[labelIndex], onRemovedLink);
    }

    public Find(labelName: string): TItem | null {
        var lbl = this.items.find(x => x.Ui.Name === labelName);
        return lbl != undefined ? lbl : null;
    }
    public FindByAddress(address: number): TItem | null {
        var lbl = this.items.find(x => x.AddressNum === address);
        return lbl != undefined ? lbl : null;
    }
    public FindByHexAddress(hexAddress: string): TItem | null {
        var lbl = this.items.find(x => x.Ui.Address === hexAddress);
        return lbl != undefined ? lbl : null;
    }

    public GetAll() {
        return this.items;
    }


}