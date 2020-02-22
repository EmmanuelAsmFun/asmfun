import { IEditorLine, IEditorFile } from "./EditorData.js";
import { IUILine } from "../ui/IUILine.js";
import { IUIZonesData } from "./IZonesData.js";
import { IUIPropertiesData, IInterpretPropertyData } from "./IPropertiesData.js";
import { IUIMacrosData, IMacroData } from "./IMacrosData.js";
import { ILabelData, IUILabelsData } from "./ILabelsData.js";

export enum LinePartType {
    Unknown,
    Space,
    Zone,
    Opcode,
    Data,
    Comment,
    OpenBlock,
    CloseBlock,
    VarSetOperator,
    VarSet,
    VarValue,
    Constant,
    Macro,
    MacroRef,
    Label,
    LabelRef,
    Property,
    PropertyRef,
}

export enum LineType {
    Unknown = 0,
    Comment = 1 << 0,
    Setter = 1 << 1,
    Macro = 1 << 2,
    Zone = 1 << 3,
    Label = 1 << 4,
    Property = 1 << 5,
    Empty = 1 << 6,
}

export interface IInterpretLine {
    Text: string;
    Parts: IInterpretLinePart[];
    NoSpaceParts: IInterpretLinePart[];
    EditorLine: IEditorLine;
    ZoneFound: boolean;
    OpcodeFound: boolean;
    LineNumber: number;
    Ui: IUILine;
}

export interface IInterpretLinePart {
    LabelRef: ILabelData | null;
    MacroRef: IMacroData | null;
    VariableRef: IInterpretPropertyData | null;
    Type: LinePartType;
    Text: string;
    Index: number;
    HasBeenParsed: boolean;
}
export interface IInterpreterBlockData {
    IsMacro: boolean;
    IsFile: boolean;
    IsRoot: boolean;
    IsIf: boolean;
    IsElse: boolean;
    IsAddr: boolean;
    IsFor: boolean;
    IsLocalZone: boolean;
    IsAnonymous: boolean;
    Name: string;
    File: IEditorFile;
    Lines: IInterpretLine[];
}
export interface IUIInterpreterBundleData {
    Zones: IUIZonesData;
    Labels: IUILabelsData;
    Properties: IUIPropertiesData;
    Macros: IUIMacrosData;
}
export function NewUIInterpreterBundleData(): IUIInterpreterBundleData {
    return {
        Properties: { List: [], Search: "", SearchChanged: () => { } },
        Zones: { List: [], Search: "", SearchChanged: () => { } },
        Macros: { List: [], Search: "", SearchChanged: () => { } },
        Labels: { List: [], Search: "", SearchChanged: () => { } },

    };
}