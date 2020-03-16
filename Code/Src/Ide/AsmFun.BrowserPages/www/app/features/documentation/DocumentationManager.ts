// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { DocumentationOpenManagerCommand } from "./commands/DocumentationCommands.js";
import { IDocumentationData, IDocFunction } from "./data/DocumentationDatas.js";
import { UIDataNameDocumentation } from "./DocumentationFactory.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IPopupWindowData, IPopupWindow, IPopupSubscription, IPopupEventData } from "../../framework/data/IPopupData.js";
import { DocumentationService } from "./services/DocumentationService.js";


export class DocumentationManager implements IPopupWindow {
  
    private mainData: IMainData;
    public data: IDocumentationData;
    private documentationService: DocumentationService;

    private popupMe: IPopupSubscription;
    public CanOpenPopup(evt: IPopupEventData) { evt.SetCanOpen(true); }
    public GetData(): IPopupWindowData {
        return this.data;
    }

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.documentationService = this.mainData.container.Resolve<DocumentationService>(DocumentationService.ServiceName) ?? new DocumentationService(mainData);
        this.popupMe = mainData.popupManager.Subscribe(0, this);
        this.data = this.mainData.GetUIData(UIDataNameDocumentation);
        this.mainData.commandManager.Subscribe2(new DocumentationOpenManagerCommand(null), this, x => this.popupMe.SwitchState(x.state));
        setTimeout(() => this.popupMe.Open(), 200);
        this.data.SelectByAddress = f => this.SelectByAddress(f);
    }

    private SelectByAddress(selected: IDocFunction): void {
        this.data.ShowByAddress = false;
        if (this.data.ComputerDoc == null) return;
        // Close all groups
        this.data.ComputerDoc.Groups.forEach(g => g.IsVisible = false);
        // Open only selected function
        this.data.ComputerDocByAddress.forEach(f => {
            f.IsVisible = selected === f;
        });
        selected.Group.IsVisible = true;
    }

    

    public OpeningPopup() {
        var thiss = this;
        if (this.data.ComputerDoc != null) return;
        this.documentationService.GetCommanderX16((r) => {
            console.log(r);
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
                        f.IsVisible = false;
                        f.SwapVisible = () => {
                            f.IsVisible = !f.IsVisible;
                            if (f.IsVisible)
                                g.IsVisible = true;
                        }
                        f.VariableDescriptions = [];
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
            this.data.ComputerDocByAddress = computerDocByAddress.sort((a, b) => a.AddressHex.localeCompare(b.AddressHex));
            this.data.ComputerDoc = r;
        });
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
        };
    }

    public static ServiceName: ServiceName = { Name: "DocumentationManager" };
}