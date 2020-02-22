import { IPropertyManager } from "./data/IPropertyManager.js";
import { IUIPropertiesData, NewUIPropertiesData, IInterpretPropertyData } from "./data/IPropertiesData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { ISourceCodeLabel } from "../project/data/ProjectData.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";

export class PropertyManager implements IPropertyManager {

    private properties: IInterpretPropertyData[] = [];

    public Ui: IUIPropertiesData = NewUIPropertiesData();

    public SetUIData(uiData: IUIPropertiesData) {
        this.Ui = uiData;
        this.Ui.List = [];
        for (var i = 0; i < this.properties.length; i++)
            this.Ui.List.push(this.properties[i].Ui);
        this.Ui.SearchChanged = () => {
            var search = AsmString.CleanSearch(this.Ui.Search);
            this.Ui.List = this.properties.filter(x => AsmString.CompareInsensitive(x.Ui.Name, search)).map(x => x.Ui);
        }
    }

    public Reset() {
        this.properties = [];
        this.Ui.List = [];
    }

    public AddProperty(line: IInterpretLine, name: string, value: string): IInterpretPropertyData {
        // Check if it already exists
        var property = this.properties.find(x => x.Ui.Name == name);
        if (property != null) {
            // Update Property
            property.Line = line;
            property.DirtyValue = value;
            return property;
        }
        // New Property
        property = this.CreateProperty(name, line);
        property.DirtyValue = value;
        return property;
    }

    public CreateProperty(name: string, line: IInterpretLine): IInterpretPropertyData {
        var property = this.NewProperty(name, line);
        this.properties.push(property);
        this.Ui.List.push(property.Ui);
        return property;
    }

    public ParseAddress(name: string, addressNum: number) {
        var propertyIndex = this.properties.findIndex(x => x.Ui.Name === name);
        if (propertyIndex < 0) return;
        var Property = this.properties[propertyIndex];
        Property.AddressNum = addressNum;
        Property.Ui.Address = AsmTools.numToHex5(addressNum);
    }

    public ParseValueDatas(labels: ISourceCodeLabel[]) {
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            var property = this.Find(label.name);
            if (property == null || property == undefined)
                continue;
            property.ValueNum = label.value;
            property.AddressNum = label.address;
            property.Ui.Value = AsmTools.numToHex2(label.value);
            property.Ui.Address = AsmTools.numToHex5(label.address);
            
            //if (editorLabel.Data != null) editorLabel.Data.dataLength = editorLabel.labelhexValue.replace("$", "").length / 2;
        }
    }
    public AddUsedBy(property: IInterpretPropertyData, lineI: InterpreterLine) {
        property.UsedByLines.push(lineI.LineNumber);
    }


    public RemoveProperty(property: IInterpretPropertyData) {
        var propertyIndex = this.properties.findIndex(x => x === property);
        if (propertyIndex > -1) this.properties.splice(propertyIndex, 1);
        propertyIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (propertyIndex > -1) this.Ui.List.splice(propertyIndex, 1);
    }
    public RemovePropertyByName(name: string) {
        var propertyIndex = this.properties.findIndex(x => x.Ui.Name === name);
        if (propertyIndex > -1) this.properties.splice(propertyIndex, 1);
        propertyIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (propertyIndex > -1) this.Ui.List.splice(propertyIndex, 1);
    }

    public Find(name: string): IInterpretPropertyData | null {
        var item = this.properties.find(x => x.Ui.Name === name);
        return item != undefined ? item : null;
    }
    public FindByAddress(address: number): IInterpretPropertyData | null {
        var lbl = this.properties.find(x => x.AddressNum === address);
        return lbl != undefined ? lbl : null;
    }
    public FindByHexAddress(hexAddress: string): IInterpretPropertyData | null {
        var lbl = this.properties.find(x => x.Ui.Address === hexAddress);
        return lbl != undefined ? lbl : null;
    }

    public GetAll() {
        return this.properties;
    }

    private NewProperty(name: string, line: IInterpretLine): IInterpretPropertyData {
        return {
            AddressNum: 0,
            Line: line,
            DirtyValue: "",
            Data: null,
            IsPointer: false,
            ValueNum: 0,
            UsedByLines:[],
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                Value: "00",
                Hilite: false,
                FileIndex: line.Ui.FileIndex,
                IsInEditMode: false,
                NewValue:"",
            }
        };
    }


}