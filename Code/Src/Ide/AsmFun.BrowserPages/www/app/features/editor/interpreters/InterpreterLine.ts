import { IInterpretLine, IUIInterpreterBundleData, IInterpretLinePart, LinePartType, LineType } from "../data/InterpreterData.js";
import { IUILine, NewUiLine } from "../ui/IUILine.js";
import { IEditorLine, IPropertyType, ResetLineProperties } from "../data/EditorData.js";
import { AsmTools } from "../../../Tools.js";
import { InterpreterBundle } from "./InterpreterBundle.js";
import { IZoneData } from "../data/IZonesData.js";
import { IOpcodeData } from "../data/IOpcodeData.js";
import { InterpreterBlock } from "./InterpreterBlock.js";
import { InterpreterValue } from "./InterpreterValue.js";
import { IInterpretPropertyData, IUIProperty } from "../data/IPropertiesData.js";
import { IMacroData } from "../data/IMacrosData.js";
import { ILabelData } from "../data/ILabelsData.js";
import { PropertyManager } from "../PropertyManager.js";

export class InterpreterLine implements IInterpretLine{
   

    private bundle: InterpreterBundle;
    public Block: InterpreterBlock;
    public Text: string = "";
    public Parts: IInterpretLinePart[] = [];
    public NoSpaceParts: IInterpretLinePart[] = [];
    public EditorLine: IEditorLine;

    public Zone: IZoneData | null = null;
    public ZoneFound: boolean = false;
    public Opcode: IOpcodeData | null = null;
    public OpcodePart: IInterpretLinePart | null = null;
    public OpcodeFound: boolean = false;
    public Property: IInterpretPropertyData | null = null;
    public PropertyFound: boolean = false;
    public Constant: IPropertyType | null = null;
    public ConstantFound: boolean = false;
    public Macro: IMacroData | null = null;
    public MacroFound: boolean = false;
    public Label: ILabelData | null = null;
    public LabelFound: boolean = false;

    public Ui: IUILine;
    public Log: boolean = false;
    public Type: LineType = LineType.Unknown;
    public Comments: InterpreterLine[] = [];
    public DataCode: string = "";
    public LineNumber: number = 0;
    public AddressNum: number = 0;
    

    constructor(line: IEditorLine, bundle: InterpreterBundle, block: InterpreterBlock) {
        this.EditorLine = line;
        this.bundle = bundle;
        this.Block = block;
        this.Ui = NewUiLine();
        this.Ui.FileIndex = line.file.Index;
        this.Ui.LineNumber = line.data.lineNumber;
        this.LineNumber = line.data.lineNumber;
        this.Reset();
    }

    public Reset() {
        this.Comments = [];
        this.ResetSameLineOnly();
    }
    public ResetSameLineOnly() {
        this.Parts = [];
        this.NoSpaceParts = [];
        this.Text = this.EditorLine.data.sourceCode.replace(/\t/g, "  ");

        this.Zone = null;
        this.ZoneFound = false;
        this.Opcode = null;
        this.OpcodePart = null;
        this.OpcodeFound = false;
        this.Property = null;
        this.PropertyFound = false;
        this.Constant = null;
        this.ConstantFound = false;
        this.Macro = null;
        this.MacroFound = false;
        this.Label = null;
        this.LabelFound = false;

        this.Type = LineType.Unknown;
        this.DataCode = "";
        this.Ui.Error = null;
        this.Ui.HasError = false;
        this.Ui.AsmFunCode = "";
        this.Ui.CanEditProp = false;
        this.EditorLine.opcode = null;
        ResetLineProperties(this.EditorLine);
    }


   
    public GetLineParts() {
        //if (this.LineNumber == 5) {
        //    debugger;
        //}
        if (this.Text.length === 0) {
            this.Type = LineType.Empty;
            return;
        }
        var current: IInterpretLinePart | null = null;
        for (var i = 0; i < this.Text.length; i++) {
            var char = this.Text[i];
            // White space
            if (char === " ") {
                current = this.ParseChar(current, LinePartType.Space, i, char);
                continue;
            }
            // Comment
            if (char === ";") {
                current = this.ParseChar(current, LinePartType.Comment, i, "");
                current.Text = this.Text.substring(i);
                this.Type = LineType.Comment;
                break;
            }
            if (char === "{") {
                current = this.ParseChar(current, LinePartType.OpenBlock, i, char);
                continue;
            }
            if (char === "}") {
                current = this.ParseChar(current, LinePartType.CloseBlock, i, char);
                continue;
            }
            if (char === "=") {
                current = this.ParseChar(current, LinePartType.VarSetOperator, i, char);
                current.HasBeenParsed = true;
                continue;
            }
            current = this.ParseChar(current, LinePartType.Unknown, i, char);
        }
        this.DataCode = this.Text;
        return this;
    }


    private ParseChar(current: IInterpretLinePart | null, type: LinePartType, index: number, char: string): IInterpretLinePart {
        if (current == null || current.Type !== type) {
            current = this.NewLinePart();
            current.Type = type;
            current.Index = index;
            this.Parts.push(current);
            if (current.Type !== LinePartType.Space && current.Type !== LinePartType.Comment)
                this.NoSpaceParts.push(current);
        }
        current.Text += char;
        return current;
    }

    private NewLinePart(): IInterpretLinePart {
        return {
            HasBeenParsed: false,
            Index: 0,
            Text: "",
            Type: LinePartType.Unknown,
            LabelRef: null,
            MacroRef: null,
            VariableRef: null,
        };
    }

    public TryFindOpcode(): number {
        var partIndex = -1;
        if (this.NoSpaceParts.length === 0) return -1;
        partIndex = 0;
        var part = this.NoSpaceParts[partIndex];
        var opcodeObj = this.bundle.OpcodeManager.GetValidOpcode(part.Text.toLocaleLowerCase());
        if (opcodeObj == null) {
            if (this.NoSpaceParts.length === 1)
                return -1;
            partIndex++;
            part = this.NoSpaceParts[partIndex];
            opcodeObj = this.bundle.OpcodeManager.GetValidOpcode(part.Text.toLocaleLowerCase());
            if (opcodeObj == null)
                return -1;
        }
        this.EditorLine.opcode = opcodeObj;
        this.Opcode = opcodeObj;
        var opcode = opcodeObj.code;
        if (opcode[0] === "b")
            this.EditorLine.isCompare = true;
        if (opcode[0] === "j")
            this.EditorLine.isJump = true;
        if (opcode === "rts") this.EditorLine.isReturn = true;
        part.HasBeenParsed = true;
        part.Type = LinePartType.Opcode;
        this.OpcodeFound = true;
        this.OpcodePart = part;
        if (this.NoSpaceParts.length  > partIndex + 1) {
            this.DataCode = this.Text.substr(this.NoSpaceParts[partIndex + 1].Index);
            var commentIndex = this.DataCode.indexOf(";");
            if (commentIndex > -1)
                this.DataCode = this.DataCode.substr(0, commentIndex);
        }
        return partIndex;
    }

    public ParseLabel(labelPartIndex: number) {
        var linePart = this.NoSpaceParts[labelPartIndex];
        if (linePart.Type !== LinePartType.Unknown) return;
        linePart.Type = LinePartType.Label;
        linePart.HasBeenParsed = true;
        var isLocalLabel = this.Text[0] == ".";
        this.LabelFound = true;
        this.Label = this.bundle.LabelManager.AddLabel(this, linePart.Text, isLocalLabel);
        this.Type = LineType.Label;
        // this.EditorLine.dataCode = labelPartIndex + 1 <= this.NoSpaceParts.length ? this.Text.substr(this.NoSpaceParts[labelPartIndex + 1].Index) : this.Text;
        if (this.Log)
            console.log("Add Label:\t\t" + this.LineNumber + "\t" +this.Label.Ui.Name);
    }

    public ParseZone(zonePartIndex: number) {
        var linePart = this.NoSpaceParts[zonePartIndex];
        if (linePart.Type !== LinePartType.Unknown) return;
        linePart.Type = LinePartType.Zone;
        linePart.HasBeenParsed = true;
        this.ZoneFound = true;
        this.Zone = this.bundle.ZoneManager.AddZone(this, linePart.Text);
        this.Type = LineType.Zone;
        if (this.Log)
            console.log("Add Zone:\t\t" + this.LineNumber+"\t"+ this.Zone.Ui.Name);
    }

    // var1 := 454
    public TryParseLabelSetter(): boolean {
        if (this.NoSpaceParts.length !== 3 || this.NoSpaceParts[1].Text != ":=") return false;
        this.NoSpaceParts[1].Type = LinePartType.VarSetOperator;
        return this.TryParseSetter();
    }
    public TryParseSetter(): boolean {
        // Example:         r10H = r10+1
        if (this.NoSpaceParts.length !== 3 || this.NoSpaceParts[1].Type !== LinePartType.VarSetOperator) return false;
        // Setter
        var propNamePart = this.NoSpaceParts[0];
        var propAddressPart = this.NoSpaceParts[2];
        //if (propNamePart.Text == "r0H") {
        //    debugger;
        //}
        var propType: IPropertyType = PropertyManager.NewPropType();
        this.Property = this.bundle.PropertyManager.AddProperty(this, propNamePart.Text, "", propType);
        this.Property.AddressNum = InterpreterValue.GetNumericAddressValue(this.bundle.PropertyManager, propAddressPart.Text);
        this.Property.Ui.Address = AsmTools.numToHex5(this.Property.AddressNum);
        this.PropertyFound = true;
        propNamePart.Type = LinePartType.VarSet;
        propAddressPart.Type = LinePartType.VarAddress;
        propNamePart.HasBeenParsed = true;
        propAddressPart.HasBeenParsed = true;
        this.NoSpaceParts[1].HasBeenParsed = true;
        this.Type = LineType.Setter;
        
        if (this.Log)
            console.log("Add Setter:\t\t" + this.LineNumber + "\t" + propNamePart.Text + "=" + propAddressPart.Text);
        return true;
    }


    public ParsePropertyWithType(propertyNameIndex: number) {
        // Example:         enemy_map: .byte 0,0,0,1,2,3
        // Variable
        var propNamePart = this.NoSpaceParts[propertyNameIndex];
        var propTypePart = this.NoSpaceParts[propertyNameIndex + 1];
        //if (propNamePart.Text == "enemy_map:") {
        //    debugger;
        //}
        var values = this.ExtractCommaSplittedRest(propertyNameIndex + 3);
        var propType = this.bundle.Interpreter.ConvertToPropertyType(propTypePart.Text, values[0]);
        propType.dataLength = propType.dataItemLength * values.length;
        this.Property = this.bundle.PropertyManager.AddProperty(this, propNamePart.Text, values[0], propType);
        this.Property.PType = propType;
        this.PropertyFound = true;
        this.NoSpaceParts[propertyNameIndex].HasBeenParsed = true;
        this.NoSpaceParts[propertyNameIndex + 1].HasBeenParsed = true;
        propNamePart.Type = LinePartType.Property;
        this.Type = LineType.Property;
        
        if (this.Log)
            console.log("Add Property:\t" + this.LineNumber + "\t" + propNamePart.Text + "=", values);
        return true;
    }

  

    public TryConstantValue(zonePartIndex: number): number {
        var part = this.NoSpaceParts[zonePartIndex];
        var txt = part.Text;
        if (txt[0] !== "#" || txt.length == 1) return 0;// || (txt.length > 1 && (txt[1] === "<" || txt[1] === ">"))) return false;
        // check if it's alpha numeric
        if (txt[1].toUpperCase() != txt[1].toLowerCase()) {
            // Link to potential var
            return 2;
        }
        this.Constant = this.bundle.Interpreter.ConvertToPropertyType( "", txt.substring(1));
        this.ConstantFound = true;
        part.Type = LinePartType.Constant;
        part.HasBeenParsed = true;
        
        //if (this.Log)
        //    console.log("Add Constant:\t" + this.LineNumber + "\t" + part.Text);
        return 1;
    }

    

    public ParseMacro(macroPartIndex: number) {
        var linePart = this.NoSpaceParts[macroPartIndex];
        if (linePart.Type !== LinePartType.Unknown) return;
        linePart.Type = LinePartType.Macro;
        linePart.HasBeenParsed = true;
        this.MacroFound = true;
        this.Macro = this.bundle.MacroManager.AddMacro(this, linePart.Text);
        this.Type = LineType.Macro;
        this.Macro.ParameterNames = this.ExtractCommaSplittedRest(3);
        this.Macro.Ui.ParametersNames = this.Macro.ParameterNames.join(",");
        if (this.Log)
            console.log("Add Macro:\t" + this.LineNumber + "\t" +this.Macro.Ui.Name);
    }

    public RenumberTo(lineNumber: number) {
        this.LineNumber = lineNumber;
        this.Ui.LineNumber = lineNumber;
        this.EditorLine.data.lineNumber = lineNumber;
        if (this.Label != null) this.Label.Ui.LineNumber = lineNumber;
        if (this.Property != null) this.Property.Ui.LineNumber = lineNumber;
        if (this.Macro != null) this.Macro.Ui.LineNumber = lineNumber;
        if (this.Zone != null) this.Zone.Ui.LineNumber = lineNumber;
    }

    private ExtractCommaSplittedRest(startPart: number): string[] {
        if (this.NoSpaceParts.length < startPart) return [];
        // Remove comments and take rest text part.
        var restText = this.Text.split(';')[0].trim().replace("{","").substring(this.NoSpaceParts[startPart-1].Index);
        var paramsDirty = restText.split(",");
        var params: string[] = [];
        for (var i = 0; i < paramsDirty.length; i++) 
            params.push(paramsDirty[i].trim());
        
        return params;
        
    }
   
}