// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'
import { IAsmFile, IAsmFolder, IFileDialogData } from '../../data/FileManagerData.js';

export class FileOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public fileDialogData: IFileDialogData | null;

    public constructor(state: boolean | null, fileDialogData: IFileDialogData | null) {
        super();
        this.state = state;
        this.fileDialogData = fileDialogData;
        this.commandName = "OpenManager";
        this.nameSpace = "File";
    }
}
