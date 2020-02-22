import { IInterpretLine, IUIInterpreterBundleData, IInterpretLinePart, LinePartType, LineType } from "../data/InterpreterData.js";
import { InterpreterBlock } from "./InterpreterBlock.js";
import { InterpreterLine } from "./InterpreterLine.js";
import { IEditorBundle, IEditorFile, CreateNewFile, IEditorManagerData, CreateNewEditorLine, IEditorLine, CreateNewEditorBundle } from "../data/EditorData.js";
import { IZoneManager } from "../data/IZoneManager.js";
import { IMacroManager } from "../data/IMacroManager.js";
import { IOpcodeManager } from "../data/IOpcodeManager.js";
import { ILabelManager } from "../data/ILabelManager.js";
import { IInterpreter } from "./IInterpreter.js";
import { IPropertyManager } from "../data/IPropertyManager.js";
import { PropertyManager } from "../PropertyManager.js";
import { OpcodeManager } from "../OpcodeManager.js";
import { ZoneManager } from "../ZoneManager.js";
import { LabelManager } from "../LabelManager.js";
import { MacroManager } from "../MacroManager.js";
import { HtmlSourceCode } from "../HtmlSourceCode.js";
import { ISourceCodeLine, IAddressDataBundle, ISourceCodeBundle } from "../../project/data/ProjectData.js";

export class InterpreterBundle {
   
    
   
    private editorBundle: IEditorBundle;
    private potentialRefsLines: InterpreterLine[] = [];
    private potentialRefsPart: IInterpretLinePart[] = [];
    //public Lines: InterpreterLine[] = [];

    private htmlSourceCode: HtmlSourceCode;

    public Ui: IUIInterpreterBundleData;
    public AllBlocks: InterpreterBlock[] = [];
    public Files: InterpreterBlock[] = [];

    public ZoneManager: IZoneManager;
    public OpcodeManager: IOpcodeManager;
    public PropertyManager: IPropertyManager;
    public MacroManager: IMacroManager;
    public LabelManager: ILabelManager;
    public Interpreter: IInterpreter;
    

    constructor(htmlSourceCode: HtmlSourceCode, ui: IUIInterpreterBundleData,
        zoneManager: IZoneManager, opcodeManager: IOpcodeManager, propertyManager: IPropertyManager, macroManager: IMacroManager, labelManager: ILabelManager,
            interpreter: IInterpreter) {
        this.editorBundle = CreateNewEditorBundle({
            name: "", sourceFileName: "", files:[],labels:[]
        });
        this.htmlSourceCode = htmlSourceCode;
        this.ZoneManager = zoneManager;
        this.OpcodeManager = opcodeManager;
        this.MacroManager = macroManager;
        this.PropertyManager = propertyManager;
        this.LabelManager = labelManager;
        this.Interpreter = interpreter;
        this.Ui = ui;
        this.ZoneManager.SetUIData(this.Ui.Zones);
        this.MacroManager.SetUIData(this.Ui.Macros);
        this.PropertyManager.SetUIData(this.Ui.Properties);
        this.LabelManager.SetUIData(this.Ui.Labels);
    }

    public Interpret(s: ISourceCodeBundle): IEditorBundle {
        this.editorBundle = CreateNewEditorBundle(s);

        // Create root context
        var rootBlock: InterpreterBlock | null = null;
        this.Files = [];
        var lines : InterpreterLine[] = []
        var s = this.editorBundle.data;
        if (s.files != null) {

            // Parse all lines
            for (var i = 0; i < s.files.length; i++) {
                var file = s.files[i];
                var editorFile: IEditorFile = CreateNewFile(file);
                editorFile.Index = i;
                this.editorBundle.files.push(editorFile);
                if (rootBlock == null) {
                    rootBlock = this.CreateBlock(editorFile);
                    rootBlock.Data.Name = "root";
                    rootBlock.Data.IsRoot = true;
                }

                var fileBlock = rootBlock.CreateChild(editorFile);
                fileBlock.Data.IsFile = true;
                fileBlock.Data.Name = editorFile.data.fileName;
                this.Files.push(fileBlock);
                var lastComments: InterpreterLine[] = [];
                if (file.lines != null) {
                    for (var j = 0; j < file.lines.length; j++) {
                        var line = file.lines[j];
                        var lineI = this.InsertLine(-1, fileBlock, editorFile, line);
                        lines.push(lineI);
                        // Add comments to method
                        if (lineI.Type === LineType.Comment) {
                            lastComments.push(lineI);
                        } else {
                            lineI.Comments = lastComments;
                            lastComments = [];
                        }
                        //if (editorLine.isEndOfBlock && block.parent != null) {
                        //    block = block.parent;
                        //}
                    }
                }
            }

            // Parse all link to the labels, variables and macros
            this.ParseLinks();

            // Convert to html
            for (var i = 0; i < lines.length; i++) {
                this.RenderLine(lines[i]);
            }
        }
        return this.editorBundle;
    }

    private ParseLinks() {
        for (var i = 0; i < this.potentialRefsLines.length; i++) {
            var lineI = this.potentialRefsLines[i];
            var part = this.potentialRefsPart[i];
            this.ParseLink(lineI,part);
        }
    }

    private ParseLink(lineI: InterpreterLine, part: IInterpretLinePart):boolean {
        var name = part.Text;
        var isPointer = false;
        if (name[0] == "#")
            name = name.substr(1);

        //if (name == "CopyTilesLoop") {
        //    debugger;
        //}
        // search in labels
        var label = this.LabelManager.Find(name);
        if (label != null) {
            part.LabelRef = label;
            part.Type = LinePartType.LabelRef;
            return true;
        }
        // search in macros
        var macro = this.MacroManager.Find(name);
        if (macro != null) {
            part.MacroRef = macro;
            part.Type = LinePartType.MacroRef;
            return true;
        }
        // search in variables
        var property = this.PropertyManager.Find(name);
        if (property != null) {
            part.VariableRef = property;
            part.Type = LinePartType.PropertyRef;
            property.IsPointer = isPointer;
            lineI.Ui.CanEditProp = true;
            lineI.Ui.Prop = property.Ui;
            this.PropertyManager.AddUsedBy(property,lineI);
            return true;
        }
        return false;
    }

    public RenderLine(lineI: InterpreterLine) {
        var html = this.htmlSourceCode.ConvertLinePartsToHtml(lineI);
        var outerHtml = html.outerHTML;
        lineI.EditorLine.sourceCodeHtml = outerHtml;
        lineI.Ui.Html = outerHtml;
        this.OpcodeManager.ParseOpcodeInLine(lineI);
    }
    public RenderLineByLineNumber(fileIndex: number, lineNumber: number) {
        var file = this.Files[fileIndex];
        this.RenderLine(file.Lines[lineNumber - 1]);
    }
    public ReInterpret(fileIndex: number, lineNumber: number, render: boolean) {
        var file = this.Files[fileIndex];
        var lineI = file.Lines[lineNumber - 1];
        this.RemoveLineLinks(lineI);
        lineI.ResetSameLineOnly();
        this.Interpreter.InterpretLineParts(this, lineI);
        this.ParseLinks();
        if (render)
            this.RenderLine(lineI);
        return lineI;
    }
    public RedrawLineNumber(fileIndex: number, lineNumber: number) {
        var file = this.Files[fileIndex];
        var lineI = file.Lines[lineNumber - 1];
        this.RenderLine(lineI);
        return lineI;
    }
    public RenumberLines(fileIndex: number, startIndex: number, length: number) {
        if (fileIndex >= this.Files.length) return;
        var file = this.Files[fileIndex];
        if (length == 0)
            length = file.Lines.length;
        for (var i = startIndex; i < length; i++) {
            var line = file.Lines[i];
            line.RenumberTo(i + 1);
            this.RenderLine(line);
        }
    }
    public CreateNewLine(fileIndex: number, lineNumber: number): IEditorLine {
        var file = this.Files[fileIndex];
        var lineI = this.InsertLine(lineNumber - 1, file, file.Data.File, {
            lineNumber: lineNumber,
            resultMemoryAddress: "",
            sourceCode: "",
        });
        this.RenumberLines(fileIndex,lineNumber, 0)
        return lineI.EditorLine;
    }

    public RemoveLine(fileIndex: number, lineNumber: number, doRenumbering: boolean) {
        if (fileIndex >= this.Files.length) return;
        var file = this.Files[fileIndex];
        var lineIndex = lineNumber - 1;
        if (lineIndex >= file.Lines.length) return;
        var line = file.Lines[lineIndex];
        this.DeleteLine(line);
        if (doRenumbering)
            this.RenumberLines(fileIndex, lineNumber - 1,0);
    }

    public CreateBlock(file: IEditorFile): InterpreterBlock {
        var block = new InterpreterBlock(this, file);
        this.AllBlocks.push(block);
        return block;
    }

    public RemoveBlock(block: InterpreterBlock) {
        var index = this.AllBlocks.indexOf(block);
        if (index > -1) this.AllBlocks.splice(index, 1);

        // Todo : Emmanuel
        //if (block.Data.IsMacro) {
        //    var macroIndex = this.editorData.macros.indexOf(block);
        //    if (macroIndex > -1) this.editorData.macros.splice(macroIndex, 1);
        //    this.editorData.macrosFiltered = [... this.editorData.macros];
        //}
    }

    public ParseAddressData(s: IAddressDataBundle) {
        for (var i = 0; i < s.files.length; i++) {
            var fileCompiled = s.files[i];
            if (fileCompiled.lines == null) continue;
            var file = this.Files.find(x => x.Data.File.data.fileName == fileCompiled.fileName);
            if (file != null) {
                if (file.Lines != null && fileCompiled.lines != null) {
                    for (var j = 0; j < fileCompiled.lines.length; j++) {
                        var lineCompiled = fileCompiled.lines[j];
                        var line = file.Lines.find(x => x.LineNumber == lineCompiled.line);
                        if (line == null) continue;
                        this.ParseHexAddress(line, lineCompiled.address);
                    }
                }
            }
        }
    }

    private ParseHexAddress(line: InterpreterLine, hexAddress: string) {
        var numAddress = parseInt(hexAddress, 16);
        line.Ui.Address = hexAddress;
        line.Ui.CanSetBreakPoint = line.Ui.Address != null && line.Ui.Address !== "";
        if (line.Property != null) {
            line.Property.AddressNum = numAddress;
            line.Property.Ui.Address = hexAddress;
        }
        if (line.Label != null) {
            line.Label.AddressNum = numAddress;
            line.Label.Ui.Address = hexAddress;
        }
    }

    public AddPotentialReference(interpretLine: InterpreterLine, linePart: IInterpretLinePart) {
        this.potentialRefsLines.push(interpretLine);
        this.potentialRefsPart.push(linePart);
    }

    public InsertLine(index: number, block: InterpreterBlock, editorFile: IEditorFile, line: ISourceCodeLine): InterpreterLine {
        var editorLine: IEditorLine = CreateNewEditorLine(line, editorFile);
        editorLine.Ui.HasError = false;
        var lineInterpreter = block.CreateLine(index, editorLine);
        editorLine.Ui = lineInterpreter.Ui;
        this.Interpreter.InterpretLineParts(this, lineInterpreter);
        this.RenderLine(lineInterpreter);
        if (index === -1) {
            editorFile.lines.push(editorLine);
        }
        else {
            editorFile.lines.splice(index,0,editorLine);
        }
        return lineInterpreter;
    }

    public DeleteLine(line: InterpreterLine) {
        var index = line.EditorLine.file.lines.indexOf(line.EditorLine);
        if (index > -1) line.EditorLine.file.lines.splice(index, 1);
        line.Block.RemoveLine(line);
        this.RemoveLineLinks(line);
    }

    private RemoveLineLinks(line: InterpreterLine) {
        if (line.Zone != null) this.ZoneManager.RemoveZone(line.Zone);
        if (line.Property != null) this.PropertyManager.RemoveProperty(line.Property);
        if (line.Macro != null) this.MacroManager.RemoveMacro(line.Macro);
        if (line.Label != null) this.LabelManager.RemoveLabel(line.Label);
    }

    public GetMacro(name: string) { return this.MacroManager.Find(name); }
    public GetZone(name: string) { return this.ZoneManager.Find(name); }
    public GetLabel(name: string) { return this.LabelManager.Find(name); }
    public GetProperty(name: string) { return this.PropertyManager.Find(name); }


    public static NewBundle(interpreter: IInterpreter, htmlSourceCode: HtmlSourceCode, ui: IUIInterpreterBundleData): InterpreterBundle {
        var bundle = new InterpreterBundle(htmlSourceCode, ui,
            new ZoneManager(), new OpcodeManager(), new PropertyManager(), new MacroManager(), new LabelManager(),
            interpreter);
        return bundle;
    }
}