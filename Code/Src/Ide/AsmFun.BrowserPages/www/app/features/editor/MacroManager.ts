import { IMacroManager } from "./data/IMacroManager.js";
import { IMacroData, IUIMacrosData, NewUIMacrosData, IUIMacro } from "./data/IMacrosData.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { NavCollection } from "./NavCollection.js";

export class MacroManager implements IMacroManager {

    private collection: NavCollection<IMacroData, IUIMacro>;

    public Ui: IUIMacrosData = NewUIMacrosData();

    public constructor() {
        this.collection = new NavCollection<IMacroData, IUIMacro>();
    }

    public SetUIData(uiData: IUIMacrosData) {
        this.Ui = uiData;
        this.collection.SetUIData(uiData);
    }

    public AddMacro(line: IInterpretLine, name: string): IMacroData {
        var cleanName = name.replace(":", "");
        var dirtyName = name;
        // Check if it already exists
        var macro = this.collection.Find(cleanName);
        if (macro != null) {
            // Update Macro
            macro.Line = line;
            return macro;
        }
        // New Macro
        macro = this.NewMacro(cleanName, line);
        this.collection.Add(macro);
        macro.DirtyName = dirtyName;
        return macro;
    }

    public CreateMacro(name: string, line: IInterpretLine): IMacroData {
        var macro = this.NewMacro(name, line);
        this.collection.Add(macro);
        return macro;
    }

    public Reset() {
        this.collection.Reset();
    }
    public ParseAddress(name: string, addressNum: number) {
        this.collection.ParseAddress(name, addressNum);
    }
    public AddUsedBy(macro: IMacroData, lineI: InterpreterLine) {
        this.collection.AddUsedBy(macro, lineI);
    }
    public RemoveMacro(macro: IMacroData) {
        this.collection.Remove(macro, i => i.MacroLink = null);
    }
    public RemoveMacroByName(name: string) {
        this.collection.RemoveByName(name, i => i.MacroLink = null);
    }
    public Find(macroName: string): IMacroData | null {
        return this.collection.Find(macroName);
    }
    public FindByAddress(address: number): IMacroData | null {
        return this.collection.FindByAddress(address);
    }
    public FindByHexAddress(hexAddress: string): IMacroData | null {
        return this.collection.FindByHexAddress(hexAddress);
    }
    public GetAll() {
        return this.collection.GetAll();
    }

    private NewMacro(name: string, line: IInterpretLine): IMacroData {
        return {
            AddressNum: 0,
            DirtyName: name,
            Line: line,
            ParameterNames: [],
            UsedByLines: [],
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
                ParametersNames: "",
                UsedByLines: [],
                ShowUsedBy: false,
                Hilite:false,
            }
        };
    }


}