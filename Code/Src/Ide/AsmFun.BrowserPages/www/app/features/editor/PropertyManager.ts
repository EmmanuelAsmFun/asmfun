import { IPropertyManager } from "./data/IPropertyManager.js";
import { IUIPropertiesData, NewUIPropertiesData, IInterpretPropertyData, IUIProperty } from "./data/IPropertiesData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { ISourceCodeLabel, IAddressDataLabel, IAddressDataLabelResponse } from "../project/data/ProjectData.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { PropertyNumType, IPropertyType } from "./data/EditorData.js";
import { InterpreterValue } from "./interpreters/InterpreterValue.js";
import { NavCollection } from "./NavCollection.js";

export class PropertyManager implements IPropertyManager {

    private collection: NavCollection<IInterpretPropertyData, IUIProperty>;

    public Ui: IUIPropertiesData = NewUIPropertiesData();

    public constructor() {
        this.collection = new NavCollection<IInterpretPropertyData, IUIProperty>();
    }

    public SetUIData(uiData: IUIPropertiesData) {
        this.Ui = uiData;
        this.collection.SetUIData(uiData);
    }


    private PropMouseHover(uiProp: IUIProperty) {
        //var prop = this.Find(uiProp.Name);
        //if (prop == null) return;
        //if (uiProp.IsMultiValue && ) {
        //    var result = "";

        //    InterpreterValue.GetNumericValue(this.bundle.PropertyManager, propAddressPart.Text);
        //}
    }


    public AddProperty(line: IInterpretLine, name: string, value: string, propType: IPropertyType): IInterpretPropertyData {
        //if (name === "@start" || name === "start") {
        //    debugger;
        //}
        // Check if it already exists
        var property = this.collection.Find(name);
        if (property != null) {
            // Update Property
            property.Line = line;
            property.DirtyValue = value;
            return property;
        }
        // New Property
        property = this.NewProperty(name, line, propType);
        this.collection.Add(property);
        property.Ui.IsMultiValue = propType.dataLength > 1;
        property.DirtyValue = value;
        //property.Ui.MouseHover = (p) => this.PropMouseHover(p);
        return property;
    }

  

    public ParseValueDatas(newLblValues: IAddressDataLabelResponse[]) {
        for (var i = 0; i < newLblValues.length; i++) {
            var label = newLblValues[i];
            var property = this.Find(label.name);
            if (property == null || property == undefined)
                continue;
            property.ValueNum = label.value;
            property.AddressNum = label.address;
            property.Ui.Value = AsmTools.numToHex2(label.value);
            property.Ui.Address = AsmTools.numToHex5(label.address);
            if (property.PType == null) continue;
            var strValues = (PropertyNumType[property.PType.dataNumType]) + ": ";
            if (property.Ui.IsMultiValue && label.values != null) {
                var values = AsmTools.Base64Decode(label.values);
                property.Values = values;
                strValues += this.PropsToString(property.PType, values);
            }
            else {
                strValues += "$"+property.Ui.Value;
            }
            property.Ui.FullValue = strValues;
        }
    }

    private PropsToString(pType: IPropertyType, values: Uint8Array): string {
        var strValues = "";
        switch (pType.dataNumType) {
            case PropertyNumType.Int16:
                if (values.length % 2 != 0) return strValues;
                if (pType.isBigEndian) {
                    for (var j = 0; j < values.length / 2; j = j + 2)
                        strValues += ((values[j + 1] << 8) | values[j]).toString() + " ";
                } else
                    for (var j = 0; j < values.length / 2; j = j + 2)
                        strValues += ((values[j] << 8) | values[j + 1]).toString() + " ";
                break;
            case PropertyNumType.Int24:
                debugger;
                if (values.length % 3 != 0) return strValues;
                if (pType.isBigEndian) {
                    for (var j = 0; j < values.length / 3; j = j + 3)
                        strValues += ((values[j + 2] << 16) | (values[j + 1] << 8) | values[j]).toString() + " ";
                } else for (var j = 0; j < values.length / 3; j = j + 3)
                    strValues += ((values[j] << 16) | (values[j + 1] << 8) | values[j + 2]).toString() + " ";
                break;
            case PropertyNumType.Int32:
                debugger;
                if (values.length % 4 != 0) return strValues;
                if (pType.isBigEndian) {
                    for (var j = 0; j < values.length / 4; j = j + 4)
                        strValues += ((values[j + 3] << 32) | (values[j + 2] << 16) | (values[j + 1] << 8) | values[j]).toString() + " ";
                } else for (var j = 0; j < values.length / 4; j = j + 4)
                    strValues += ((values[j] << 32) | (values[j + 1] << 16) | (values[j + 2] << 8) | values[j + 3]).toString() + " ";
                break;
            case PropertyNumType.Byte:
            default:
                for (var j = 0; j < values.length; j++)
                    strValues += "$"+ AsmTools.numToHex2(values[j]) + " ";
                break;
        }
        return strValues;
    }


    public Reset() {
        this.collection.Reset();
    }
    public ParseAddress(name: string, addressNum: number) {
        this.collection.ParseAddress(name, addressNum);
    }
    public AddUsedBy(property: IInterpretPropertyData, lineI: InterpreterLine) {
        this.collection.AddUsedBy(property, lineI);
    }
    public RemoveProperty(property: IInterpretPropertyData) {
        this.collection.Remove(property, i => i.PropertyLink = null);
    }
    public RemovePropertyByName(name: string) {
        this.collection.RemoveByName(name, i => i.PropertyLink = null);
    }
    public Find(propertyName: string): IInterpretPropertyData | null {
        return this.collection.Find(propertyName);
    }
    public FindByAddress(address: number): IInterpretPropertyData | null {
        return this.collection.FindByAddress(address);
    }
    public FindByHexAddress(hexAddress: string): IInterpretPropertyData | null {
        return this.collection.FindByHexAddress(hexAddress);
    }
    public GetAll() {
        return this.collection.GetAll();
    }

    private NewProperty(name: string, line: IInterpretLine,propType: IPropertyType): IInterpretPropertyData {
        return {
            AddressNum: 0,
            Line: line,
            DirtyValue: "",
            PType: propType,
            IsPointer: false,
            ValueNum: 0,
            UsedByLines: [],
            Values:null,
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                Value: "00",
                Hilite: false,
                FileIndex: line.Ui.FileIndex,
                IsInEditMode: false,
                NewValue: "",
                IsMultiValue: false,
                FullValue:"",
                MouseHover: (i) => { },
                ShowUsedBy: false,
                UsedByLines: [],
            },
            DirtyName:"",
        };
    }
   
    public static NewPropType(): IPropertyType{
        return {
            dataItemLength: 1,
            dataLength: 1,
            dataNumType: PropertyNumType.Byte,
            dataType: "",
            dataString: "",
            defaultNumValue: 0,
            isBigEndian: false,
            isNumericLight: false,
        }
    }


}