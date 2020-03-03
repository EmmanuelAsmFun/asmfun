import { ILabelManager } from "./data/ILabelManager.js";
import { ILabelData, IUILabelsData, NewUILabelsData, IUILabel } from "./data/ILabelsData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { NavCollection } from "./NavCollection.js";

export class LabelManager implements ILabelManager {

    private collection: NavCollection<ILabelData, IUILabel>;
    public Ui: IUILabelsData = NewUILabelsData();

    public constructor() {
        this.collection = new NavCollection<ILabelData, IUILabel>();
    }

    public SetUIData(uiData: IUILabelsData) {
        this.Ui = uiData;
        this.collection.SetUIData(uiData);
    }

    public AddLabel(line: IInterpretLine, name: string, isLocalLabel: boolean): ILabelData {
        var cleanName = name.replace(":", "");
        var dirtyName = name;
        // Check if it already exists
        var label = this.collection.Find(cleanName);
        if (label != null) {
            // Update Label
            label.Line = line;
            return label;
        }
        label = this.NewLabel(cleanName, line);
        this.collection.Add(label);
        label.IsLocalLabel = isLocalLabel;
        label.DirtyName = dirtyName;
        var isNextAn = cleanName == "+" || cleanName.indexOf("++") > -1;
        var isPrevAn = cleanName == "-" || cleanName.indexOf("--") > -1;
        if (isNextAn || isPrevAn)
            label.IsAnonymousLabel = true;
        return label;
    }

    public Reset() {
        this.collection.Reset();
    }
    public ParseAddress(name: string, addressNum: number) {
        this.collection.ParseAddress(name, addressNum);
    }
    public AddUsedBy(label: ILabelData, lineI: InterpreterLine) {
        this.collection.AddUsedBy(label, lineI);
    }
    public RemoveLabel(label: ILabelData) {
        this.collection.Remove(label, i => i.LabelLink = null);
    }
    public RemoveLabelByName(name: string) {
        this.collection.RemoveByName(name, i => i.LabelLink = null);
    }
    public Find(labelName: string): ILabelData | null{
        return this.collection.Find(labelName);
    }
    public FindByAddress(address: number): ILabelData | null {
        return this.collection.FindByAddress(address);
    }
    public FindByHexAddress(hexAddress: string): ILabelData | null {
        return this.collection.FindByHexAddress(hexAddress);
    }
    public GetAll() {
        return this.collection.GetAll();
    }

    private NewLabel(name: string, line: IInterpretLine): ILabelData {
        return {
            AddressNum: 0,
            IsLocalLabel: false,
            IsAnonymousLabel: false,
            DirtyName: name,
            Line: line,
            UsedByLines:[],
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
                Hilite: false,
                UsedByLines: [],
                ShowUsedBy:false,
            }
        };
    }


}