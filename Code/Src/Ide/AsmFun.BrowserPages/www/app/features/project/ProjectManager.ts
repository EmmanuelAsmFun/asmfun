// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import {
    IProjectManagerData, ProjectCompilerTypes, ProjectComputerTypes, IUserSettings, InternetSourceType, IProjectDetail, IProjectSettings,
    IBuildConfiguration, CompilerNames, RomVersionNames, NewProjectManagerData, NewBuildConfiguration
} from "./data/ProjectData.js";
import { ProjectService } from "./services/ProjectService.js";
import {
    ProjectLoadCommand, ProjectLoadWebCommand, ProjectLoadLocalCommand, ProjectRequestCreateNewCommand, ProjectCreateNewCommand, ProjectSaveFolderCommand,
    ProjectOpenManagerCommand, ProjectOpenProjectWebsiteCommand, ProjectRequestLoadProgramCommand, ProjectSettingsLoaded
} from "./commands/ProjectsCommands.js";
import { ComputerStartCommand, ComputerLoadProgramCommand, ComputerOpenManagerCommand } from "../../features/computer/commands/ComputerCommands.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IAsmFunAppData } from "../player/data/AsmFunAppData.js";
import { NotifyIcon, ErrorIcon, ConfirmIcon } from "../../common/Enums.js";
import { IFileDialogData } from "../fileManager/data/FileManagerData.js";
import { FileOpenManagerCommand } from "../fileManager/commands/FileCommands.js";
import { EditorManager } from "../editor/EditorManager.js";
import { ASMStorage } from "../../Tools.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameProject } from "./ProjectFactory.js";
import { IPopupSubscription, IPopupWindow, IPopupWindowData, IPopupEventData } from "../../framework/data/IPopupData.js";
import { EditorClearProjectCommand } from "../editor/commands/EditorCommands.js";


export class ProjectManager implements IPopupWindow {

    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IProjectManagerData;
    private service: ProjectService;
    private userSettings?: IUserSettings;

    private popupMe: IPopupSubscription;
    public OpeningPopup() { }
    public ClosingPopup() { }
    public GetData(): IPopupWindowData {
        return this.data;
    }


    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.GetUIData(UIDataNameProject);
        this.popupMe = mainData.popupManager.Subscribe(0, this);
        this.service = this.mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);

        this.mainData.commandManager.Subscribe2(new ProjectOpenManagerCommand(null), this, x => this.popupMe.SwitchState(x.state));
        this.mainData.commandManager.Subscribe2(new ProjectSaveFolderCommand(), this, x => this.SaveProjectsFolder());
        this.mainData.commandManager.Subscribe2(new ProjectCreateNewCommand(), this, () => this.CreateNewProject());
        this.mainData.commandManager.Subscribe2(new ProjectRequestCreateNewCommand(), this, () => this.NewProjectRequest());
        this.mainData.commandManager.Subscribe2(new ProjectLoadWebCommand(), this, x => this.LoadWebExisting(x.detail));
        this.mainData.commandManager.Subscribe2(new ProjectLoadLocalCommand(), this, x => this.LoadLocalExisting(x.detail));
        this.mainData.commandManager.Subscribe2(new ProjectOpenProjectWebsiteCommand(), this, x => this.ProjectOpenProjectWebsite(x.detail));
        this.mainData.commandManager.Subscribe2(new ProjectRequestLoadProgramCommand(), this, x => this.RequestLoadProgram());
    }

    public LoadOne() {
        var thiss = this;
        this.service.GetProjectSettings((s) => {
            this.data.settings = s;
            thiss.Load(s);
        }, error => {
                // project doesn't exist
                thiss.popupMe.Open();
        });
    }
   
    private SaveProjectsFolder() {
        var thiss = this;
        if (this.userSettings == null) return;
        this.userSettings.projectsFolder = this.data.projectsFolder;
        this.service.SaveUserSettings(this.userSettings, (r) => {
            thiss.myAppData.alertMessages.Notify("Projects folder updated.", NotifyIcon.OK);
        }, () => { });
    }

    private NewProjectRequest() {
        if (this.data.projectIsDownloading) return;
        this.data.isNewProject = !this.data.isNewProject;
        this.data.newBuildConfiguration = NewBuildConfiguration();
    }

    private CreateNewProject() {
        var thiss = this;
        if (this.data.newProjectFileName == null || this.data.newProjectFileName.length < 2) {
            this.myAppData.alertMessages.ShowError("Project name is empty", "The project name in the project folder is empty.", ErrorIcon.Exclamation);
            return;
        };
        this.data.newBuildConfiguration.compilerType = this.data.newProjectCompiler;
        this.data.newBuildConfiguration.romVersion = this.data.newProjectRomVersion;
        this.mainData.commandManager.InvokeCommand(new EditorClearProjectCommand());
        this.service.CreateNew(this.data.newProjectFileName, this.data.newProjectDeveloperName, this.data.newBuildConfiguration, (settings) => { thiss.Load(settings); });
        this.data.isNewProject = false;
        this.data.newProjectFileName = "";
    }

    private ProjectOpenProjectWebsite(detail?: IProjectDetail | null) {
        if (detail == null || detail.projectUrl == null) return;
        open(detail.projectUrl, "_blank");
    }

    

    private LoadLocalExisting(detail?: IProjectDetail | null) {
        var thiss = this;
        if (this.data.projectIsDownloading) return;
        this.CheckRequireSave(() => {
            if (detail == null) {
                var fileDialogSettings: IFileDialogData = {
                    filter: "*.asm|*.a|AsmFunSettings.json",
                    initialFolder: null,
                    onSelected: () => { },
                    selectAFile: true,
                    title: "Select the start ASM file",
                    subTitle: "*.asm | *.a | AsmFunSettings.json",
                    onClose: () => {
                    }
                };
                fileDialogSettings.onSelected = file => {
                    if (file != null && file.length > 1) {
                        this.data.projectIsDownloading = true;
                        this.service.LoadByMainFilename(file, (settings) => {
                            thiss.Load(settings);
                            thiss.data.projectIsDownloading = false;
                        }, e => { thiss.data.projectIsDownloading = false; });
                    }
                };
                //if (!this.data.showOpenFileFolder) {
                //this.data.projectIsDownloading = true;
                //this.service.LoadByFileSelectorPopup(() => {
                //    thiss.Load();
                //    thiss.data.projectIsDownloading = false;
                //}, e => { thiss.data.projectIsDownloading = false; });
                //return;
                //}
                //if (this.data.openFileFolder != null && this.data.openFileFolder.length > 1) {
                //    this.data.projectIsDownloading = true;
                //    this.service.LoadByMainFilename(this.data.openFileFolder, () => {
                //        thiss.Load();
                //        thiss.data.projectIsDownloading = false;
                //    }, e => { thiss.data.projectIsDownloading = false; });
                //}
                this.mainData.commandManager.InvokeCommand(new FileOpenManagerCommand(true, fileDialogSettings));
                return;
           
        }
        this.data.projectIsDownloading = true;
            this.service.LoadLocalExisting(detail, (settings) => {
                thiss.Load(settings);
            thiss.data.projectIsDownloading = false;
        }, e => { thiss.data.projectIsDownloading = false; });
        });
    }

    public RequestLoadProgram() {
        var thiss = this;
        if (this.data.projectIsDownloading) return;
        this.CheckRequireSave(() => {
            var fileDialogSettings: IFileDialogData = {
                filter: "*.prg",
                initialFolder: null,
                onSelected: () => { },
                selectAFile: true,
                title: "Select a PRG file",
                subTitle: "*.prg",
                onClose: () => { },
            };
            fileDialogSettings.onSelected = file => {
                if (file != null && file.length > 1) {
                    this.data.projectIsDownloading = true;
                    this.service.LoadProgram(file, (settings) => {
                        thiss.Load(settings);
                        thiss.data.projectIsDownloading = false;
                        thiss.mainData.commandManager.InvokeCommand(new ComputerStartCommand());
                        thiss.mainData.commandManager.InvokeCommand(new ComputerOpenManagerCommand(true));
                        setTimeout(() => {
                            thiss.mainData.commandManager.InvokeCommand(new ComputerLoadProgramCommand());
                        }, 3000);
                    }, e => { thiss.data.projectIsDownloading = false; });
                }
            };
            this.mainData.commandManager.InvokeCommand(new FileOpenManagerCommand(true, fileDialogSettings));
        });
    }

    private CheckRequireSave(checkdone: () => void) {
        var svc = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
        if (svc == null || !svc.requireSave) {
            checkdone();
            return;
        }
        this.mainData.appData.alertMessages.Confirm("Are you sure?", "There are unsaved changes. Are you sure you want to continue without save?", ConfirmIcon.Exclamation,
            ok => {
                if (ok) {
                    checkdone();
                    return;
                }
                return;
            }
        )
    }

    public LoadWebExisting(detail: IProjectDetail | null) {
        if (this.data.projectIsDownloading) return;
        this.CheckRequireSave(() => {
            var thiss = this;
            if (detail == null) return;
            this.mainData.appData.alertMessages.Confirm("Download " + detail.developerName + "'s " + detail.name,
                "Are you sure you want to download this external project from <a href=\"" + detail.internetSource + "\">"
                + detail.internetSource + "</a>", ConfirmIcon.Question, (r) => {
                    if (r) {
                        thiss.data.projectIsDownloading = true;
                        thiss.service.LoadWebExisting(detail, (settings) => {
                            thiss.Load(settings);
                            thiss.data.projectIsDownloading = false;
                        }, e => { thiss.data.projectIsDownloading = false; });
                    }
                }, "Yes", "No");
        });
    }

    private Load(settings: IProjectSettings) {
        this.popupMe.Close();
    }

    public ProjectGetProp<T>(name: string): T | null {
        if (this.data.settings == null || this.data.settings.detail == null) return null;
        return ASMStorage.StoreGetProp<T>(this.data.settings.detail.name+"."+name);
    }
    public ProjectSetProp<T>(name: string, obj: T) {
        if (this.data.settings == null || this.data.settings.detail == null) return;
        ASMStorage.StoreSetProp<T>(this.data.settings.detail.name + "." + name,obj);
    }

    public CanOpenPopup(evt: IPopupEventData) {
        var thiss = this;
        this.service.GetUserSettings((r) => {
            thiss.userSettings = r;
            thiss.data.projectsFolder = r.projectsFolder;
            thiss.data.localProjects = r.localProjects;
            thiss.data.isNewProject = false;
            thiss.data.showOpenFileFolder = r.platform !== "Windows";
            if (thiss.data.showOpenFileFolder)
                thiss.data.folderChar = "/";
            thiss.service.GetWebProjects((w) => {
                thiss.data.webProjects = w;
            });
            evt.SetCanOpen(true);
        }, e => { });
    }
   



    public static NewData(): IProjectManagerData {
        return NewProjectManagerData();
    }

    public static ServiceName: ServiceName = { Name: "ProjectManager" };
}

