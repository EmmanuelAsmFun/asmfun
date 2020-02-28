import { IEditorLine, IEditorFile, IPropertyType } from "./EditorData.js";
import { IUILine } from "../ui/IUILine.js";
import { IUIZonesData, IZoneData } from "./IZonesData.js";
import { IUIPropertiesData, IInterpretPropertyData } from "./IPropertiesData.js";
import { IUIMacrosData, IMacroData } from "./IMacrosData.js";
import { ILabelData, IUILabelsData } from "./ILabelsData.js";
import { IOpcodeData } from "./IOpcodeData.js";
import { IUIFile } from "../ui/IUIFile.js";

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
    VarAddress,
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
    AddressNum: number;
    Text: string;
    Parts: IInterpretLinePart[];
    NoSpaceParts: IInterpretLinePart[];
    EditorLine: IEditorLine;
    LineNumber: number;
    Ui: IUILine;
    Zone: IZoneData | null ;
    ZoneFound: boolean;
    Opcode: IOpcodeData | null ;
    OpcodePart: IInterpretLinePart | null ;
    OpcodeFound: boolean;
    Property: IInterpretPropertyData | null ;
    PropertyFound: boolean;
    Constant: IPropertyType | null ;
    ConstantFound: boolean;
    Macro: IMacroData | null ;
    MacroFound: boolean;
    Label: ILabelData | null ;
    LabelFound: boolean;
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
    Files: IUIFile[];
    Lines: IUILine[];
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
        Lines: [],
        Files:[],
    };
}