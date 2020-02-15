import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";
import { IEditorFile, IEditorLine } from "../data/EditorData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion



export class KeyboardKeyCommand extends BaseCommand{

    public which: number = -1;
    public key: string = '';
    public ctrlKey: boolean = false;
    public altKey: boolean = false;
    public shiftKey: boolean = false;
    public allowContinueEmit: boolean = true;

    public constructor(){
        super();
        this.commandName = "KeyboardKeyCommand";
        this.nameSpace = "Editor";
    }
}
export class EditorCodeAssistCommand extends BaseCommand{

    public constructor(){
        super();
        this.commandName = "CodeAssistCommand";
        this.nameSpace = "Editor";
    }
}
export class CloseEditorCodeAssistCommand extends BaseCommand{

    public constructor(){
        super();
        this.commandName = "CloseCodeAssistCommand";
        this.nameSpace = "Editor";
    }
}

export class EditorPasteCommand extends BaseCommand{
    public text: string;
    public constructor(text:string){
        super();
        this.text = text;
        this.commandName = "PasteCommand";
        this.nameSpace = "Editor";
    }
}
export class EditorInsertTextCommand extends BaseCommand{
    public text?: string;
    public removeText?: string;
    public constructor(removeText?:string,text?: string) {
        super();
        this.text = text;
        this.removeText = removeText;
        this.commandName = "InsertLabelCommand";
        this.nameSpace = "Editor";
    }
}

export class EditorEnableCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "EditorEnable";
        this.nameSpace = "Editor";
    }
}
export class EditorSelectFileCommand extends BaseCommand {
    public file: IEditorFile | null;
    public constructor(file: IEditorFile | null) {
        super();
        this.file = file;
        this.commandName = "SelectFile";
        this.nameSpace = "Editor";
    }
}

export class EditorSwapOutputCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "SwapOutput";
        this.nameSpace = "Editor";
    }
}
export class EditorReloadLineCommand extends BaseCommand {
    public line: IEditorLine | null;
    public constructor(line: IEditorLine | null) {
        super();
        this.line = line;
        this.commandName = "ReloadLine";
        this.nameSpace = "Editor";
    }
}
export class EditorScrollToLineCommand extends BaseCommand {
    public line: IEditorLine | null;
    public constructor(line: IEditorLine | null) {
        super();
        this.line = line;
        this.commandName = "ScrollToLine";
        this.nameSpace = "Editor";
    }
}