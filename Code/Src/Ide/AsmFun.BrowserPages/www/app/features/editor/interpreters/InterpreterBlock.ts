import { IInterpreterBlockData, IInterpretLine } from "../data/InterpreterData.js";
import { IEditorFile, IEditorLine } from "../data/EditorData.js";
import { InterpreterBundle } from "./InterpreterBundle.js";
import { InterpreterLine } from "./InterpreterLine.js";
import { IUILine } from "../ui/IUILine.js";

export class InterpreterBlock {
   
    private bundle: InterpreterBundle;
    public Lines: InterpreterLine[] = [];
    public UiLines: IUILine[] = [];
    public Data: IInterpreterBlockData;
    public Parent: InterpreterBlock | null;
    public Children: InterpreterBlock[] = [];

    constructor(bundle: InterpreterBundle, file: IEditorFile) {
        this.bundle = bundle;
        this.Parent = null;
        this.Data = this.NewInterpreterBlockData(file);
    }

    public CreateChild(editorFile: IEditorFile): InterpreterBlock {
        var child = this.bundle.CreateBlock(editorFile);
        child.Parent = this;
        this.Children.push(child);
        return child;
    }

    public RemoveChild(block: InterpreterBlock) {
        // move context of items to parent context
        for (var i = 0; i < this.Lines.length; i++) {
            var line = this.Lines[i];
            // if we are at the root, then the line will be deleted definively, so we set it to line.context at the end.
            line.Block = this.Parent != null ? this.Parent : line.Block;
        }
        this.bundle.RemoveBlock(block);
        
        if (block.Parent != null) {
            var indexP = block.Parent.Children.indexOf(block);
            if (indexP > -1) block.Parent.Children.splice(indexP, 1);
        }
    }

    public Reset() {
        this.Children = [];
        this.Parent = null;
    }

    public CreateLine(index: number, line: IEditorLine): InterpreterLine {
        var lineInterpreter = new InterpreterLine(line, this.bundle, this);
        if (index == -1) {
            this.Lines.push(lineInterpreter);
            this.UiLines.push(lineInterpreter.Ui);
        }
        else {
            this.Lines.splice(index, 0, lineInterpreter);
            this.UiLines.splice(index, 0, lineInterpreter.Ui);
        }
        return lineInterpreter;
    }

    public RemoveLine(line: InterpreterLine) {
        var index = this.Lines.indexOf(line);
        if (index > -1) {
            this.Lines.splice(index, 1);
            this.UiLines.splice(index, 1);
        }
    }


    private NewInterpreterBlockData(file: IEditorFile): IInterpreterBlockData {
        return {
            File: file,
            IsRoot: false,
            Lines: [],
            Name: "",
            IsAddr: false,
            IsAnonymous: false,
            IsElse: false,
            IsFile: false,
            IsFor: false,
            IsIf: false,
            IsLocalZone: false,
            IsMacro: false,
            Index:0,
        };
    }
}