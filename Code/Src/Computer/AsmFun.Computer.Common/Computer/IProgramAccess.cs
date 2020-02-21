using AsmFun.Computer.Common.Memory;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Computer
{
    public interface IProgramAccess
	{
		void Step();
		void SetStartFolder(string folder);

		List<MemoryDumpData> GetLoadedMemoryBlocks();
	}
}
