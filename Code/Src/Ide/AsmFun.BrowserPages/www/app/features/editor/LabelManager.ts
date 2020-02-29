import { ILabelManager } from "./data/ILabelManager.js";
import { ILabelData, IUILabelsData, NewUILabelsData } from "./data/ILabelsData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";

export class LabelManager implements ILabelManager {
   

    private labels: ILabelData[] = [];

    public Ui: IUILabelsData = NewUILabelsData();

    public SetUIData(uiData: IUILabelsData) {
        this.Ui = uiData;
        this.Ui.SearchChanged = () => {
            var search = AsmString.CleanSearch(this.Ui.Search);
            this.Ui.List = this.labels.filter(x => AsmString.CompareInsensitive(x.Ui.Name, search)).map(x => x.Ui);
        }
    }

    public Reset() {
        this.labels = [];
        this.Ui.List = [];
    }

    public AddLabel(line: IInterpretLine, name: string, isLocalLabel: boolean): ILabelData {
        var cleanName = name.replace(":", "");
        var dirtyName = name;
        // Check if it already exists
        var label = this.labels.find(x => x.Ui.Name == cleanName);
        if (label != null) {
            // Update Label
            label.Line = line;
            return label;
        }
        // New Label
        label = this.CreateLabel(cleanName, line);
        label.IsLocalLabel = isLocalLabel;
        label.DirtyName = dirtyName;
        var isNextAn = cleanName == "+" || cleanName.indexOf("++") > -1;
        var isPrevAn = cleanName == "-" || cleanName.indexOf("--") > -1;
        if (isNextAn || isPrevAn)
            label.IsAnonymousLabel = true;
        return label;
    }

    public CreateLabel(name: string, line: IInterpretLine): ILabelData {
        var label = this.NewLabel(name, line);
        this.labels.push(label);
        this.Ui.List.push(label.Ui);
        return label;
    }

    public ParseAddress(name: string, addressNum: number) {
        var labelIndex = this.labels.findIndex(x => x.Ui.Name === name);
        if (labelIndex < 0) return;
        var label = this.labels[labelIndex];
        label.AddressNum = addressNum;
        label.Ui.Address = AsmTools.numToHex5(addressNum);
    }

    public RemoveLabel(label: ILabelData) {
        var labelIndex = this.labels.findIndex(x => x === label);
        if (labelIndex > -1) this.labels.splice(labelIndex, 1);
        labelIndex = this.Ui.List.findIndex(x => x === label.Ui);
        if (labelIndex > -1) this.Ui.List.splice(labelIndex, 1);
    }
    public RemoveLabelByName(name: string) {
        var labelIndex = this.labels.findIndex(x => x.Ui.Name === name);
        if (labelIndex > -1) this.labels.splice(labelIndex, 1);
        labelIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (labelIndex > -1) this.Ui.List.splice(labelIndex, 1);
    }

    public Find(labelName: string): ILabelData | null{
        var lbl = this.labels.find(x => x.Ui.Name === labelName);
        return lbl != undefined ? lbl : null;
    }
    public FindByAddress(address: number): ILabelData | null {
        var lbl = this.labels.find(x => x.AddressNum === address);
        return lbl != undefined ? lbl : null;
    }
    public FindByHexAddress(hexAddress: string): ILabelData | null {
        var lbl = this.labels.find(x => x.Ui.Address === hexAddress);
        return lbl != undefined ? lbl : null;
    }

    public GetAll() {
        return this.labels;
    }


    private NewLabel(name: string, line: IInterpretLine): ILabelData {
        return {
            AddressNum: 0,
            IsLocalLabel: false,
            IsAnonymousLabel: false,
            DirtyName: name,
            Line: line,
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
                Hilite: false,
            }
        };
    }


}