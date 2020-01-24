// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IProjectManagerData, ProjectCompilerTypes, ProjectComputerTypes, IUserSettings, InternetSourceType, IProjectDetail, IProjectSettings, IBuildConfiguration, CompilerNames, RomVersionNames, NewProjectManagerData, NewBuildConfiguration } from "../data/ProjectData.js";
import { ProjectService } from "../services/projectService.js";
import { NotifyIcon, ConfirmIcon, ErrorIconName, ErrorIcon } from "../common/Enums.js";
import { ProjectLoadCommand, ProjectLoadWebCommand, ProjectLoadLocalCommand, ProjectRequestCreateNewCommand, ProjectCreateNewCommand, ProjectSaveFolderCommand, ProjectOpenManagerCommand, ProjectOpenProjectWebsiteCommand, ProjectRequestLoadProgramCommand } from "../data/commands/ProjectsCommands.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { ASMStorage } from "../Tools.js";
import { FileOpenManagerCommand } from "../data/commands/FileCommands.js";
import { IFileDialogData } from "../data/FileManagerData.js";
import { ComputerStartCommand, ComputerLoadProgramCommand, ComputerOpenManagerCommand } from "../data/commands/ComputerCommands.js";
import { EditorManager } from "./EditorManager.js";


export class ProjectManager  {

    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IProjectManagerData;
    private service: ProjectService = new ProjectService();
    private userSettings?: IUserSettings;
    public isVisible: boolean = false;


    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.projectManager;
        this.mainData.commandManager.Subscribe2(new ProjectOpenManagerCommand(null), this, x => this.OpenManager(x.state));
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
            thiss.Load();
        }, error => {
            // project doesn't exist
            thiss.Open();
        });
    }
    public OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }

    public Open() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
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
                thiss.Show();
            });
        }, e => { });
    }
    public Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.Hide();
    }
    private Show() {
        var thiss = this;
        this.data.isVisible = true;
        setTimeout(() => { thiss.data.isVisiblePopup = true; }, 10)
    }
    private Hide() {
        var thiss = this;
        setTimeout(() => { thiss.data.isVisible = false; }, 200)
        this.data.isVisiblePopup = false;
    }

    public SaveProjectsFolder() {
        var thiss = this;
        if (this.userSettings == null) return;
        this.userSettings.projectsFolder = this.data.projectsFolder;
        this.service.SaveUserSettings(this.userSettings, (r) => {
            thiss.myAppData.alertMessages.Notify("Projects folder updated.", NotifyIcon.OK);
        });
    }

    public NewProjectRequest() {
        if (this.data.projectIsDownloading) return;
        this.data.isNewProject = !this.data.isNewProject;
        this.data.newBuildConfiguration = NewBuildConfiguration();
    }

    public CreateNewProject() {
        var thiss = this;
        if (this.data.newProjectFileName == null || this.data.newProjectFileName.length < 2) {
            this.myAppData.alertMessages.ShowError("Project name is empty", "The project name in the project folder is empty.", ErrorIcon.Exclamation);
            return;
        };
        this.data.newBuildConfiguration.compilerType = this.data.newProjectCompiler;
        this.data.newBuildConfiguration.romVersion = this.data.newProjectRomVersion;
        this.service.CreateNew(this.data.newProjectFileName, this.data.newProjectDeveloperName, this.data.newBuildConfiguration, () => { thiss.Load(); });
        this.data.isNewProject = false;
        this.data.newProjectFileName = "";
    }

    public ProjectOpenProjectWebsite(detail?: IProjectDetail | null) {
        if (detail == null || detail.projectUrl == null) return;
        open(detail.projectUrl, "_blank");
    }

    

    public LoadLocalExisting(detail?: IProjectDetail | null) {
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
                };
                fileDialogSettings.onSelected = file => {
                    if (file != null && file.length > 1) {
                        this.data.projectIsDownloading = true;
                        this.service.LoadByMainFilename(file, () => {
                            thiss.Load();
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
        this.service.LoadLocalExisting(detail, () => {
            thiss.Load();
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
            };
            fileDialogSettings.onSelected = file => {
                if (file != null && file.length > 1) {
                    this.data.projectIsDownloading = true;
                    this.service.LoadProgram(file, () => {
                        thiss.Load();
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
                        thiss.service.LoadWebExisting(detail, () => {
                            thiss.Load();
                            thiss.data.projectIsDownloading = false;
                        }, e => { thiss.data.projectIsDownloading = false; });
                    }
                }, "Yes", "No");
        });
    }

    private Load() {
        this.mainData.commandManager.InvokeCommand(new ProjectLoadCommand());
        this.Close();
    }

    public ProjectGetProp<T>(name: string): T | null {
        if (this.data.settings == null || this.data.settings.detail == null) return null;
        return ASMStorage.StoreGetProp<T>(this.data.settings.detail.name+"."+name);
    }
    public ProjectSetProp<T>(name: string, obj: T) {
        if (this.data.settings == null || this.data.settings.detail == null) return;
        ASMStorage.StoreSetProp<T>(this.data.settings.detail.name + "." + name,obj);
    }


    public static NewData(): IProjectManagerData {
        return NewProjectManagerData();
    }

    public static ServiceName: ServiceName = { Name: "ProjectManager" };
}

