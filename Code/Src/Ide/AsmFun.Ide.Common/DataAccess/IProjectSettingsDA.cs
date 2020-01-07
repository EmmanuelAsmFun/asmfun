﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface IProjectSettingsDA
    {
        string StorageFileName { get; set; }
        string StorageFolder { get; set; }

        ProjectSettings TryLoadByFolderOrCreate(string projectFolder,string hintStartFile);
        ProjectSettings LoadByMainFilename(string projectMainFileNameAndFolder);
        ProjectSettings LoadByFolder(string projectFolder);
        ProjectSettings CreateNewByFilename(string projectFolderFileName, string projectFolder);
        void Save(ProjectSettings settings);
        BuildConfiguration CreateDefaultConfiguration();
    }
}