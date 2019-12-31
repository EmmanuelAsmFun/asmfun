#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface IUserSettingsDA
    {
        UserSettings Load();
        UserSettings Reset();
        void Save(UserSettings settings);
        UserSettings Get();
    }
}