using AsmFun.Computer.Common.IO.Data;
using System;

namespace AsmFun.Computer.Common.IO
{
	public interface IJoystickReader : IDisposable
    {
		int NumJoysticks { get; }

		void Init();

		void UpdateStates();

		JoystickState GetStates(int index);

		
	}
}
