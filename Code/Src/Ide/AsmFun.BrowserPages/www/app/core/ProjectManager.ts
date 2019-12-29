// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IProjectManagerData, ProjectCompilerTypes, ProjectComputerTypes, IUserSettings, InternetSourceType, IProjectDetail, IProjectSettings, IBuildConfiguration, CompilerNames, RomVersionNames } from "../data/ProjectData.js";
import { ProjectService } from "../services/projectService.js";
import { NotifyIcon, ConfirmIcon } from "../common/Enums.js";
import { ProjectLoadCommand, ProjectLoadWebCommand, ProjectLoadLocalCommand, ProjectRequestCreateNewCommand, ProjectCreateNewCommand, ProjectSaveFolderCommand, ProjectOpenManagerCommand, ProjectOpenProjectWebsiteCommand } from "../data/commands/ProjectsCommands.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";


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
    }

    public LoadOne() {
        var thiss = this;
        this.service.GetProjectSettings(() => {
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
            thiss.data.showOpenFileFolder = r.platform !== "Windows";
            if (thiss.data.showOpenFileFolder)
                thiss.data.folderChar = "/";
            thiss.service.GetWebProjects((w) => {
                thiss.data.webProjects = w;
                thiss.data.isVisible = true;
            });
        }, e => { });
    }
    public Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.data.isVisible = false;
    }

    public SaveProjectsFolder() {
        var thiss = this;
        if (this.userSettings == null) return;
        this.userSettings.projectsFolder = this.data.projectsFolder;
        this.service.SaveUserSettings(this.userSettings, (r) => {
            thiss.myAppData.alertMessages.Notify("Projects Folder Saved.", NotifyIcon.OK);
        });
    }

    public NewProjectRequest() {
        if (this.data.projectIsDownloading) return;
        if (this.data.newProjectFileName == null || this.data.newProjectFileName.length < 2) return;
        this.data.isNewProject = true;
        this.data.newBuildConfiguration = ProjectManager.NewBuildConfiguration();
    }

    public CreateNewProject() {
        var thiss = this;
        if (this.data.newProjectFileName == null || this.data.newProjectFileName.length < 2) return;
        this.data.newBuildConfiguration.compilerType = this.data.newProjectCompiler;
        this.data.newBuildConfiguration.romVersion = this.data.newProjectRomVersion;
        this.service.CreateNew(this.data.newProjectFileName, this.data.newProjectDeveloperName, this.data.newBuildConfiguration, () => { thiss.Load(); });
    }

    public ProjectOpenProjectWebsite(detail?: IProjectDetail | null) {
        if (detail == null || detail.projectUrl == null) return;
        open(detail.projectUrl, "_blank");
    }

    public LoadLocalExisting(detail?: IProjectDetail | null) {
        var thiss = this;
        if (this.data.projectIsDownloading) return;
        if (detail == null) {
            if (!this.data.showOpenFileFolder) {
                this.data.projectIsDownloading = true;
                this.service.LoadByFileSelectorPopup(() => {
                    thiss.Load();
                    thiss.data.projectIsDownloading = false;
                }, e => { thiss.data.projectIsDownloading = false; });
                return;
            }
            if (this.data.openFileFolder != null && this.data.openFileFolder.length > 1) {
                this.data.projectIsDownloading = true;
                this.service.LoadByMainFilename(this.data.openFileFolder, () => {
                    thiss.Load();
                    thiss.data.projectIsDownloading = false;
                }, e => { thiss.data.projectIsDownloading = false; });
            }
            return;
        }
        this.data.projectIsDownloading = true;
        this.service.LoadLocalExisting(detail, () => {
            thiss.Load();
            thiss.data.projectIsDownloading = false;
        }, e => { thiss.data.projectIsDownloading = false; });
    }

    public LoadWebExisting(detail: IProjectDetail | null) {
        if (this.data.projectIsDownloading) return;
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
            },"Yes","No");
    }

    private Load() {
        this.mainData.commandManager.InvokeCommand(new ProjectLoadCommand());
        this.Close();
    }

    public static NewData(): IProjectManagerData {
        return {
            isNewProject: false,
            isVisible: false,
            projectsFolder: "",
            localProjects: [],
            webProjects: [],
            newProjectFileName: "",
            newBuildConfiguration: ProjectManager.NewBuildConfiguration(),
            openFileFolder: "",
            showOpenFileFolder: true,
            folderChar: "\\",
            projectIsDownloading: false,
            compilerNames: CompilerNames,
            newProjectCompiler: 1,
            newProjectRomVersion: "R33",
            romVersionNames: RomVersionNames,
            newProjectDeveloperName:""
        }
    }
    public static NewBuildConfiguration(): IBuildConfiguration {
        return {
            addonCommandLine: "",
            compilerType: ProjectCompilerTypes.ACME,
            compilerVariables: "",
            computerType: ProjectComputerTypes.CommanderX16,
            outputFolderName: "output",
            programFileName: "",
            romVersion: "R33"
        };
    }

    public static ServiceName: ServiceName = { Name: "ProjectManager" };
}

