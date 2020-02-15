export interface IAsmFile {
    notSelectable: boolean | null;
    fileName: string;
    folder: string;
    extension: string;
    fileSize: number;
    fileSizeString: string;
    modified: string;
    modifiedString: string;
}
export interface IAsmFolder {
    files: IAsmFile[];
    folders: IAsmFolder[];
    name: string;
    folder: string;
    isParentFolder: boolean | null;
} 
export interface IFileDialogData {
    initialFolder: string | null;
    filter: string | null;
    title: string;
    subTitle: string;
    selectAFile: boolean;
    onSelected: ((f: string) => void) | null;
    onClose: (() => void) | null;
}
export interface IFileManagerData {
    isSelectFileDialog: boolean;
    isVisible: boolean;
    isVisiblePopup: boolean;
    title: string;
    subTitle: string;
    currentFolder: IAsmFolder | null;
    goParentFolder: (f: IAsmFolder) => void;
    selectFile: (f: IAsmFile) => void;
    openFolder: (f: string) => void;
    selectFolder: () => void;
}
export function NewFileManagerData(): IFileManagerData {
    return {
        isVisible: false,
        isVisiblePopup: false,
        goParentFolder: () => { },
        isSelectFileDialog: true,
        selectFile: () => { },
        openFolder: () => { },
        selectFolder: () => { },
        currentFolder: null,
        title: "Select",
        subTitle: "",
    }
}