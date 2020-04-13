// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { DocumentationOpenManagerCommand } from "./commands/DocumentationCommands.js";
import { IDocumentationData, IDocFunction, IDocRootObject, IDocGroup } from "./data/DocumentationDatas.js";
import { UIDataNameDocumentation } from "./DocumentationFactory.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IPopupWindowData, IPopupWindow, IPopupSubscription, IPopupEventData } from "../../framework/data/IPopupData.js";
import { DocumentationService } from "./services/DocumentationService.js";
import { SourceCodeManager } from "../editor/SourceCodeManager.js";
import { SelectedLineChanged } from "../editor/commands/EditorCommands.js";
import { IEditorLine } from "../editor/data/EditorData.js";


export class DocumentationManager implements IPopupWindow {

    private lastSelectedLine: IEditorLine | null = null;
    private docRoot: IDocRootObject | null = null;
    private mainData: IMainData;
    public data: IDocumentationData;
    private documentationService: DocumentationService;
    private sourceCodeManager: SourceCodeManager;

    private popupMe: IPopupSubscription;
    public CanOpenPopup(evt: IPopupEventData) { evt.SetCanOpen(true); }
    public GetData(): IPopupWindowData {
        return this.data;
    }

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.documentationService = this.mainData.container.Resolve<DocumentationService>(DocumentationService.ServiceName) ?? new DocumentationService(mainData);
        this.sourceCodeManager = this.mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(mainData);
        this.popupMe = mainData.popupManager.Subscribe(0, this);
        this.data = this.mainData.GetUIData(UIDataNameDocumentation);
        // Commands
        this.mainData.commandManager.Subscribe2(new DocumentationOpenManagerCommand(null, null), this, x => {
            this.popupMe.SwitchState(x.state);
            if (x.hiliteLastLine)
                this.HiliteFunctionByLine(null);
        });
        // Events
        this.mainData.eventManager.Subscribe2(new SelectedLineChanged(null), this, x => this.EditorLineChanged(x.line));
        
        this.data.SelectByAddress = f => this.SelectByAddress(f);
        this.data.SearchChanged = s => this.Search(s);
        this.data.NewUsed = () => this.FilterUsed();

        if (document.location.href.indexOf("popup=documentation") > -1)
            setTimeout(() => this.popupMe.Open(), 200);
        this.LoadData();
    }

    private Search(search: string) {
        
        if (this.data.ComputerDoc == null || this.docRoot == null || search == null) return;
        search = search.trim().replace(/_/g,' ').replace(/-/g," ");
        if (search === "" || search.length < 3) {
            this.data.ComputerDoc.Groups = this.docRoot.Groups;
            return;
        }
        var searchParts = search.toLocaleLowerCase().split(' ');
        var groups: IDocGroup[] = [];
        this.docRoot.Groups.forEach(g => {
            var newGroup: IDocGroup | null = null; 
            g.Functions.forEach(f => {
                var found = true;
                for (var i = 0; i < searchParts.length; i++) {
                    if (f.TagsSearch.indexOf(searchParts[i]) <0) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    // Found
                    if (newGroup == null) {
                        newGroup = { ...g };
                        newGroup.Functions = [];
                        newGroup.IsVisible = true;
                        groups.push(newGroup);
                    }
                    f.IsVisible = true;
                    newGroup.Functions.push(f);
                }
               
            });
        });
        this.data.ComputerDoc.Groups = groups;
    }

    private SelectByAddress(selected: IDocFunction): void {
        this.data.ShowByAddress = false;
        if (this.data.ComputerDoc == null) return;
        this.Search("");
        this.SelectFunction(selected);
    }

    private SelectFunction(selected: IDocFunction) {
        if (this.data.ComputerDoc == null) return;
        // Close all groups
        this.data.ComputerDoc.Groups.forEach(g => g.IsVisible = false);
        // Open only selected function
        this.data.ComputerDocByAddress.forEach(f => {
            f.IsVisible = selected === f;
        });
        selected.Group.IsVisible = true;
    }

    private EditorLineChanged(line: IEditorLine | null): void {
        this.lastSelectedLine = line;
    }

    private HiliteFunctionByLine(line: IEditorLine | null)
    {
        if (line == null)
            line = this.lastSelectedLine;
        if (!this.data.isVisible) return;
        
        if (this.sourceCodeManager.Bundle == null || line == null) return;
        var lineI = this.sourceCodeManager.Bundle.GetLine(line);
        if (lineI == null) return;
        var addressLink = 0;
        if (lineI.Property != null && lineI.Property.AddressNum > 0)
            addressLink = lineI.Property.AddressNum;
        else if (lineI.PropertyLink != null && lineI.PropertyLink.AddressNum > 0)
            addressLink = lineI.PropertyLink.AddressNum;
        if (addressLink == 0) return;
        var f = this.GetFunctionByAddress(addressLink);
        if (f == null) return;
        this.SelectFunction(f);
    }

    private GetFunctionByAddress(address: number): IDocFunction | null {
        var f = this.data.ComputerDocByAddress.find(x => x.Address === address);
        return f != undefined ? f : null;
    }

    

    public LoadData() {
        this.documentationService.GetCommanderX16((r) => {
           
            var computerDocByAddress: IDocFunction[] = [];
            // inject visibility prop
            if (r == null || r.Groups == null || r.VariableDefinitions == null) return;
            r.GeneralInfos.forEach(gi => {
                gi.IsVisible = false;
                gi.SwapVisible = () => {
                    gi.IsVisible = !gi.IsVisible;
                }
                if (gi.LongDescription != null)
                    gi.LongDescription = this.ToHtml(gi.LongDescription);
            });
            // Variable definitions
            r.VariableDefinitions.forEach(vd => {
                if (vd.Values != null && vd.Values.length > 0 && vd.Values[0].Categories != null && vd.Values[0].Categories.length > 0) {
                    vd.Values.forEach(vdc => {
                        vdc.Category = vdc.Categories[0];
                    });
                    vd.Values = vd.Values.sort((a, b) => a.Category.localeCompare(b.Category));
                }
            });
            // Groups
            r.Groups.forEach(g => {
                g.IsVisible = false;
                g.SwapVisible = () => {
                    g.IsVisible = !g.IsVisible;
                }
                if (g.Functions != null) {
                    g.Functions.forEach(f => {
                        computerDocByAddress.push(f);
                        f.Group = g;
                        f.TagsSearch = f.Tags != null? f.Tags.join(" ").toLowerCase() :"";
                        f.IsVisible = false;
                        f.SwapVisible = () => {
                            f.IsVisible = !f.IsVisible;
                            if (f.IsVisible)
                                g.IsVisible = true;
                        }
                        f.VariableDescriptions = [];
                        f.Address = f.AddressHex != null? parseInt(f.AddressHex, 16):0;
                        if (f.LongDescription != null)
                            f.LongDescription = this.ToHtml(f.LongDescription);
                        if (f.Parameters != null && f.Parameters.length > 0) {
                            for (var pa = 0; pa < f.Parameters.length; pa++) {
                                var param = f.Parameters[pa];
                                if (param.LinkTarget != null && param.LinkTarget !== "") {
                                    var descr = r.VariableDefinitions.find(x => x.Code === param.LinkTarget);
                                    if (descr != null)
                                        f.VariableDescriptions.push(descr);
                                }
                                if (param.Values != null) {
                                }
                            }
                        }
                    });
                }
            });
            this.docRoot = { ...r };
            this.data.ComputerDocByAddress = computerDocByAddress.sort((a, b) => a.AddressHex.localeCompare(b.AddressHex));
            this.data.ComputerDoc = r;
            this.FilterUsed();
        });
    }

    private FilterUsed() {
        if (this.data.ComputerDocByAddress == null || this.sourceCodeManager.Bundle == null) return;
        var propManager = this.sourceCodeManager.Bundle.PropertyManager;
        this.data.ComputerDocByAddress.forEach(f => {
            if (f.AddressHex != null) {
                var searchAd = f.AddressHex;
                if (searchAd.length < 5)
                    searchAd = "0" + searchAd;
                f.IsUsed = propManager.FindByHexAddress(searchAd) != null;
            }
        });
        
    }

  

    public OpeningPopup() {
        var thiss = this;

        if (this.data.ComputerDoc != null) {
            this.FilterUsed();
            return;
        }
        this.LoadData();
    }

    private ToHtml(data: string) {
        return data
            .replace(/\.A/g, "<span class=\"flagText\">A</span>")
            .replace(/\.X/g, "<span class=\"flagText\">X</span>")
            .replace(/\.Y/g, "<span class=\"flagText\">Y</span>")
            .replace(/\.C/g, "<span class=\"flagText\">C</span>")
            .replace(/\.N/g, "<span class=\"flagText\">N</span>")
            .replace(/\br0\b/g, "<span class=\"flagText\">r0</span>")
            .replace(/\br0L\b/g, "<span class=\"flagText\">r0L</span>")
            .replace(/\br0H\b/g, "<span class=\"flagText\">r0H</span>")
            .replace(/\br1\b/g, "<span class=\"flagText\">r1</span>")
            .replace(/\br1L\b/g, "<span class=\"flagText\">r1L</span>")
            .replace(/\br1H\b/g, "<span class=\"flagText\">r1H</span>")
            .replace(/\br2\b/g, "<span class=\"flagText\">r2</span>")
            .replace(/\br3\b/g, "<span class=\"flagText\">r3</span>")
            .replace(/\br15H\b/g, "<span class=\"flagText\">r15H</span>")
            .replace(/\r\n/g, "<br />")
            .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }

    public ClosingPopup() {
    }


    public static NewData(): IDocumentationData {
        return {
            isVisible: false,
            isVisiblePopup: false,
            ComputerDoc: null,
            ComputerDocByAddress: [],
            ShowByAddress: false,
            SelectByAddress: () => { },
            ShowGeneral: false,
            NewUsed: () => { },
            SearchChanged: () => { },
            SearchText: "",
        };
    }

    public static ServiceName: ServiceName = { Name: "DocumentationManager" };
}