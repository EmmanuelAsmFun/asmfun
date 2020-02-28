export interface IUIFile {
    Index: number;
    IsSelected: boolean;
    FileName: string;
    RequireSave: boolean | null;
    Folder: string;
    IsCodeFile: boolean;
    IsBinary: boolean;
    IsIncludeFile: boolean;
    Exists: boolean;
}
export function NewUIFile(): IUIFile {
    return {
        Index: 0,
        IsSelected: false,
        FileName: "",
        Exists: false,
        Folder: "",
        IsBinary: false,
        IsCodeFile: false,
        RequireSave: false,
        IsIncludeFile:false,
    }
}