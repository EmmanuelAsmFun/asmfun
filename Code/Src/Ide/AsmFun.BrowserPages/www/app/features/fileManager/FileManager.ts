﻿import { IMainData } from "../../framework/data/MainData";
import { IFileManagerData, IAsmFile, IAsmFolder, NewFileManagerData, IFileDialogData } from "./data/FileManagerData.js";
import { FileService } from "./services/FileService.js";
import { FileOpenManagerCommand } from "./commands/FileCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { ProjectService } from "../project/services/ProjectService.js";
import { ASMStorage } from "../../Tools.js";
import { UIDataNameFileManager } from "./FileManagerFactory.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export interface IFileManager {

}


export class FileManager implements IFileManager {

    private filter: string | null = null;
    private initialFolder: string | null = null;
    private onSelected: ((f: string) => void) | null = null;
    private onClose: (() => void) | null = null;
    private mainData: IMainData;
    private data: IFileManagerData;
    private projectService: ProjectService;
    private fileService: FileService;

    public constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameFileManager);
        // Ressolve services
        this.projectService = mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);
        this.fileService = mainData.container.Resolve<FileService>(FileService.ServiceName) ?? new FileService(mainData);
        // Subscribe to commands
        mainData.commandManager.Subscribe2(new FileOpenManagerCommand(null, null), this,
            x => this.OpenManager(x.state, x.fileDialogData));
        this.data.openFolder = f => this.OpenFolderByName(f,null,null);
        this.data.goParentFolder = f => this.OpenParentFolder(f);
        this.data.selectFile = f => this.SelectFile(f);
        this.data.selectFolder = () => this.SelectFolder();
    }

    private SelectFile(file: IAsmFile) {
        if (this.onSelected == null) return;
        this.onSelected(file.folder + "/" + file.fileName);
        this.Close();
    }
    private SelectFolder() {
        if (this.onSelected == null || this.data.currentFolder == null) return;
        this.onSelected(this.data.currentFolder.folder);
    }

    private OpenFolder(folder: IAsmFolder) {
        this.OpenFolderByName(folder.folder,null,null);
    }

    private OpenParentFolder(folder: IAsmFolder) {
        if (this.data.currentFolder == null) return;
        var parts = this.data.currentFolder.folder.split('/');
        if (parts.length < 2) return;
        parts.pop();
        var newFolder = parts.join('/');
        this.OpenFolderByName(newFolder,null,null);
    }

    private OpenFolderByName(folder: string, doneMethod: (() => void) | null, error: ((e) => void) | null) {
        if ((folder == null || folder === undefined) && this.data.currentFolder != null && this.data.currentFolder.folder != null)
            folder = this.data.currentFolder.folder;
        var filterr = this.filter ?? "";
        this.fileService.GetFiles(folder, filterr, f => {
            // Insert parent folder element
            f.folders = [{ isParentFolder: true, files: [], folders: [], folder: "..", name: ".." }, ...f.folders];
            if (f.files != null) {
                var filterOnAsm = this.filter == "*.asm|*.a|AsmFunSettings.json";
                var filterOnPrg = this.filter == "*.prg";
                var filterIsCompiler = this.filter != null && this.filter.indexOf('.exe') > -1;
                for (var i = 0; i < f.files.length; i++) {
                    var file = f.files[i];
                    if (file.fileSize != null)
                        file.fileSizeString = ASMStorage.HumanFileSize(file.fileSize);
                    file.notSelectable = false;
                    if (filterOnAsm) {
                        if (file.extension.toLowerCase() === ".asm" || file.extension.toLowerCase() === ".a" || file.fileName === "AsmFunSettings.json") {
                        }
                        else
                            file.notSelectable = true;
                    }
                    if (filterOnPrg) {
                        if (file.extension.toLowerCase() !== ".prg") 
                            file.notSelectable = true;
                    }
                    if (filterIsCompiler) {
                        if (file.fileName !== this.filter)
                            file.notSelectable = true;
                    }
                }
            }
            this.data.currentFolder = f;
            if (doneMethod)
                doneMethod();
        }, error);
    }

    private OpenManager(state: boolean | null, fileDialogData: IFileDialogData | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state && fileDialogData != null) {
            this.filter = fileDialogData.filter;
            this.onSelected = fileDialogData.onSelected;
            this.initialFolder = fileDialogData.initialFolder;
            this.data.isSelectFileDialog = fileDialogData.selectAFile;
            this.data.title = fileDialogData.title;
            this.data.subTitle = fileDialogData.subTitle;
            this.onClose = fileDialogData.onClose;
        }
        
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        if (this.initialFolder == null) this.initialFolder = "";
        var thiss = this;
        this.OpenFolderByName(this.initialFolder, () => {
                thiss.Show();
        }, er => {
            thiss.Hide();
        });
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

    private Close() {
        if (this.onClose != null)
            this.onClose();
        this.Hide();
    }




    public static NewData(): IFileManagerData {
        return NewFileManagerData();
    }

    public static ServiceName: ServiceName = { Name: "FileManager" };
}