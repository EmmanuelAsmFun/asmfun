import { IMacroManager } from "./data/IMacroManager.js";
import { IMacroData, IUIMacrosData, NewUIMacrosData } from "./data/IMacrosData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";

export class MacroManager implements IMacroManager {

    private macros: IMacroData[] = [];

    public Ui: IUIMacrosData = NewUIMacrosData();

    public SetUIData(uiData: IUIMacrosData) {
        this.Ui = uiData;
        this.Ui.List = [];
        for (var i = 0; i < this.macros.length; i++)
            this.Ui.List.push(this.macros[i].Ui);
        this.Ui.SearchChanged = () => {
            var search = AsmString.CleanSearch(this.Ui.Search);
            this.Ui.List = this.macros.filter(x => AsmString.CompareInsensitive(x.Ui.Name, search)).map(x => x.Ui);
        }
    }

    public Reset() {
        this.macros = [];
        this.Ui.List = [];
    }

    public AddMacro(line: IInterpretLine, name: string): IMacroData {
        var cleanName = name.replace(":", "");
        var dirtyName = name;
        // Check if it already exists
        var macro = this.macros.find(x => x.Ui.Name == cleanName);
        if (macro != null) {
            // Update Macro
            macro.Line = line;
            return macro;
        }
        // New Macro
        macro = this.CreateMacro(cleanName, line);
        macro.DirtyName = dirtyName;
        return macro;
    }

    public CreateMacro(name: string, line: IInterpretLine): IMacroData {
        var macro = this.NewMacro(name, line);
        this.macros.push(macro);
        this.Ui.List.push(macro.Ui);
        return macro;
    }

    public ParseAddress(name: string, addressNum: number) {
        var macroIndex = this.macros.findIndex(x => x.Ui.Name === name);
        if (macroIndex < 0) return;
        var macro = this.macros[macroIndex];
        macro.AddressNum = addressNum;
        macro.Ui.Address = AsmTools.numToHex5(addressNum);
    }

    public RemoveMacro(macro: IMacroData) {
        var macroIndex = this.macros.findIndex(x => x === macro);
        if (macroIndex > -1) this.macros.splice(macroIndex, 1);
        macroIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (macroIndex > -1) this.Ui.List.splice(macroIndex, 1);
    }
    public RemoveMacroByName(name: string) {
        var macroIndex = this.macros.findIndex(x => x.Ui.Name === name);
        if (macroIndex > -1) this.macros.splice(macroIndex, 1);
        macroIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (macroIndex > -1) this.Ui.List.splice(macroIndex, 1);
    }

    public Find(name: string): IMacroData | null {
        var item = this.macros.find(x => x.Ui.Name === name);
        return item != undefined ? item : null;
    }

    public GetAll() {
        return this.macros;
    }

    private NewMacro(name: string, line: IInterpretLine): IMacroData {
        return {
            AddressNum: 0,
            DirtyName: name,
            Line: line,
            ParameterNames: [],
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
                ParametersNames:"",
            }
        };
    }


}