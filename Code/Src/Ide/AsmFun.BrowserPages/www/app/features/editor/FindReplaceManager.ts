import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IMainData } from "../../framework/data/MainData.js";
import { EditorManager } from "./EditorManager.js";
import { KeyboardKeyCommand, EditorSelectFileCommand } from "./commands/EditorCommands.js";
import { IUIFindReplaceData, NewFindReplaceData, IFindReplaceJob, IFindReplaceResultItem } from "./data/FindReplaceData.js";
import { UIDataNameFindReplace } from "./EditorFactory.js";
import { FindReplaceOpenManagerCommand, FindReplaceSearchNextCommand, FindReplaceReplaceNextCommand } from "./commands/FindReplaceCommands.js";
import { SourceCodeManager } from "./SourceCodeManager.js";
import { InterpreterBlock } from "./interpreters/InterpreterBlock.js";
import { EditorData } from "./data/EditorData.js";
import { AsmTools } from "../../Tools.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { ICommandEvent } from "../../framework/ICommandManager.js";

export class FindReplaceManager {
    
    private isSelectingFile = false;
    private createdElements: HTMLDivElement[] = [];
    private charWidth: number = new EditorData().charWidth;
  
    private mainData: IMainData;
    private sourceCodeManager: SourceCodeManager;
    private data: IUIFindReplaceData;

    private lastFile: InterpreterBlock | null = null;
    private lastSearch: IFindReplaceJob | null = null;
    private lastHilite: IFindReplaceResultItem | null = null;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameFindReplace);
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(this.mainData);
        mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this, this.KeyPressed);
        mainData.commandManager.Subscribe2(new FindReplaceOpenManagerCommand(null), this, (c) => this.Open(c.state));
        mainData.commandManager.Subscribe2(new FindReplaceSearchNextCommand(), this, () => this.SearchNext());
        mainData.commandManager.Subscribe2(new FindReplaceReplaceNextCommand(), this, () => this.ReplaceNext());
        this.data.SearchWord = "";
        this.data.ReplaceWord = "";
    }


    private KeyPressed(key: KeyboardKeyCommand, evt: ICommandEvent) {
        // Executed even when hidden.
        switch (key.key) {
            case "F3": 
                if (!this.data.IsVisible)
                    this.Open(true);
                key.allowContinueEmit = false;
                this.mainData.commandManager.InvokeCommand(new FindReplaceSearchNextCommand());
                evt.ContinuePropagation = false;
                break;
        }
        if (key.ctrlKey) {
            switch (key.key) {
                case "f": // Find and replace
                    this.mainData.commandManager.InvokeCommand(new FindReplaceOpenManagerCommand(true));
                    key.allowContinueEmit = false;
                    evt.ContinuePropagation = false;
                    return;
            }
        }
        if (!this.data.IsVisible || this.lastSearch == null) return;
    }

    public ClearSearch() {
        for (var i = 0; i < this.createdElements.length; i++)
            this.createdElements[i].remove();
    }

    public ReplaceNext(): void {
        if (this.data.ReplaceWord == null) return;
        
        if (this.lastSearch != null && this.lastSearch.Results.length > 0 && this.lastHilite != null && this.lastHilite.Line != null && !this.lastHilite.IsReplaced) {
            var text = this.lastHilite.Line.EditorLine.data.sourceCode;
            var startPart = text.substring(0, this.lastHilite.XOffset);
            var endPart = text.substring(this.lastHilite.XOffset + this.lastHilite.Length);
            var newText = startPart + this.data.ReplaceWord + endPart;
            this.lastHilite.Line.EditorLine.data.sourceCode = newText;
            this.lastHilite.Line.EditorLine.file.Ui.RequireSave = true;
            this.sourceCodeManager.RedrawLine(this.lastHilite.Line.EditorLine);
            this.lastHilite.IsReplaced = true;
            var svc = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
            if (svc != null)
                svc.requireSave = true;
        }
        this.SearchNext();
    }

    public SearchNext(): void {
        if (this.data.SearchWord == null || this.data.SearchWord === "") return;
        if (this.sourceCodeManager.Bundle == null || this.sourceCodeManager.Bundle.Files.length == 0) return;
        var files = this.sourceCodeManager.Bundle.Files.filter(x => x.Data.File.Ui.IsCodeFile || x.Data.File.Ui.IsIncludeFile);

        if (!this.IsSameJob()) {
            if (this.lastSearch == null)
                this.lastSearch = this.CreateJob();
            
            // Start new Search
            this.lastSearch = this.CreateJob();

            if (this.lastFile == null) {
                this.lastFile = files[0];
            }
            this.SearchInFile();
        }
        if (this.lastSearch == null) return;
        if (this.lastSearch.LastFileIndex >= files.length)
            this.lastSearch.LastFileIndex = 0;

        if (this.lastFile != null && this.lastSearch.LastFileIndex !== this.lastFile.Data.Index) {
            // Change file
            this.lastFile = files[this.lastSearch.LastFileIndex];
            // Start searhing in the file.
            this.SearchInFile();
        }

      

        // Hilite all in file
        this.HiliteInFile();

        // Set to next search
        this.lastSearch.LastViewIndex++;
        if (this.lastSearch.LastViewIndex >= this.lastSearch.Results.length ) {
            this.lastSearch.LastViewIndex = 0;

            // Prepare next file
            this.lastSearch.LastFileIndex++;
            if (this.lastSearch.LastFileIndex >= files.length || files.length === 0)
                this.lastSearch.LastFileIndex = 0;
        }
    }

    public SelectAndHiliteInFile(fileIndex: number) {
        if (this.lastFile != null && this.lastFile.Data.Index == fileIndex || !this.data.IsVisible) return;
        if (this.sourceCodeManager.Bundle == null || this.sourceCodeManager.Bundle.Files.length == 0) return;
        var files = this.sourceCodeManager.Bundle.Files;
        this.lastFile = files[fileIndex];
        this.SearchInFile();
        this.HiliteInFile();
    }

    private SearchInFile() {
        if (this.lastSearch == null || this.lastFile == null) return;
        this.lastSearch.Results = [];
        var results = this.lastSearch.Results;
        var regEx = this.data.IsRegEx ? new RegExp(this.data.SearchWord) : this.String2Regex(this.data.SearchWord);
        var match: RegExpExecArray | null;
        for (var i = 0; i < this.lastFile.Lines.length; i++) {
            var line = this.lastFile.Lines[i];
            var lineText = line.EditorLine.data.sourceCode;
            var ff = 0;
            while ((match = regEx.exec(lineText)) != null) {
                var result: IFindReplaceResultItem = {
                    FileIndex: this.lastFile.Data.Index,
                    LineNumber: line.LineNumber,
                    XOffset: match.index,
                    Length: this.data.SearchWord.length,
                    Line: line,
                    IsReplaced: false,
                }
                results.push(result);
                ff++;
                if (ff > 500)
                    break;
            }
        }
        this.data.ResultsCount = results.length;
    }

    
    private HiliteInFile() {

        // Remove previous search
        this.ClearSearch();

        if (this.lastSearch == null || this.lastFile == null) return;
        if (this.data.ResultsCount === 0) {
            this.lastHilite = null;
            return;
        }
        var results = this.lastSearch.Results;
        // Select current file
        if (!this.isSelectingFile) {
            this.isSelectingFile = true;
            this.mainData.commandManager.InvokeCommand(new EditorSelectFileCommand(this.lastFile.Data.File.Ui));
            this.isSelectingFile = false;
        }
        for (var j = 0; j < results.length; j++) {
            var result = results[j];
            var lineHtml = document.getElementById("lineCode" + result.LineNumber);
            if (lineHtml != null && lineHtml.parentNode != null) {
                var className = "FindSelect";
                if (this.lastSearch.LastViewIndex == j) {
                    AsmTools.scrollIntoViewWithParent("lineCode" + result.LineNumber, "sourceCode", true);
                    className += " Hilite";
                    this.lastHilite = result;
                }
                var hiliteHtml = document.createElement("div");
                hiliteHtml.innerHTML = "&nbsp;";
                hiliteHtml.className = className;
                hiliteHtml.style.left = (result.XOffset * this.charWidth) + 'px';
                hiliteHtml.style.width = (result.Length * this.charWidth + 2) + 'px';
                lineHtml.parentNode.insertBefore(hiliteHtml, lineHtml);

                this.createdElements.push(hiliteHtml);
            }
        }   
    }

    private String2Regex(search: string) {
        var s = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(this.data.MatchWord ? ("\\b"+s+"\\b") : s, "g" + (this.data.MatchCase? "":"i"));
        //return new RegExp(s.match(/\/(.+)\/.*/)[1], s.match(/\/.+\/(.*)/)[1]);
    }

    private CreateJob(): IFindReplaceJob {
        return {
            Search: this.data.SearchWord,
            Results: [],
            LastViewIndex: 0,
            LastFileIndex: 0,
            IsRegEx: this.data.IsRegEx,
            MatchCase: this.data.MatchCase,
            MatchWord: this.data.MatchWord,
        };
    }

    private IsSameJob() {
        if (this.lastSearch == null) return false;
        if (
            this.lastSearch.Search === this.data.SearchWord &&
            this.lastSearch.IsRegEx === this.data.IsRegEx &&
            this.lastSearch.MatchWord === this.data.MatchWord &&
            this.lastSearch.MatchCase === this.data.MatchCase 
        )
            return true;
        return false;
    }

  
   

    private Open(state: boolean | null): void {
        if (state == null)
            this.data.IsVisible = !this.data.IsVisible
        else
            this.data.IsVisible = state;
        if (!this.data.IsVisible)
            this.ClearSearch();
    }

    public static NewData(): IUIFindReplaceData {
        return NewFindReplaceData();
    }

    public static ServiceName: ServiceName = { Name: "FindManager" };

}