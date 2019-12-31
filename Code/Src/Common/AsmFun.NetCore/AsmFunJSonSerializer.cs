#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Common.DataAccess;
using System.IO;
using System.Text.Json;

namespace AsmFun.Core
{
    public class AsmFunJSonSerializer : IAsmJSonSerializer
    {
        public JsonSerializerOptions Options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };
        public AsmFunJSonSerializer()
        {

        }

        public T DeserializeFile<T>(string filePath)
        {
            return DeserializeObject<T>(File.ReadAllText(filePath));
        }
        public void SerializeFile<T>(string filePath,T instance)
        {
            File.WriteAllText(filePath, JsonSerializer.Serialize(instance, Options));
        }
        public T DeserializeObject<T>(string jsonString)
        {
            var jsonModel = JsonSerializer.Deserialize<T>(jsonString, Options);
            return jsonModel;
        }
        public string SerializeObject<T>(T instance)
        {
            var jsonData = JsonSerializer.Serialize(instance, Options);
            return jsonData;
        }
    }
}
