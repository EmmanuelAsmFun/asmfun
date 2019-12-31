#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


namespace AsmFun.Common.DataAccess
{
    public interface IAsmJSonSerializer
    {
        T DeserializeFile<T>(string filePath);
        void SerializeFile<T>(string filePath, T instance);
        T DeserializeObject<T>(string jsonString);
        string SerializeObject<T>(T instance);
    }
}
