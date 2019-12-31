#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Controls;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace AsmFun.UI.Consolee.Core
{
    public interface IControlActivationManager
    {
        int ActiveControlIndex { get; }
        bool PreviousControl(int jump = 1);
        bool NextControl(int jump = 1);
        void ActivateLastControl();
        bool Interterpret(ConsoleKeyInfo key, ConsoleCommand command);
        void ShowError(Exception ex);
    }

    public class ControlActivationManager<TConsoleControl> : IControlActivationManager
        where TConsoleControl : class, IConsoleControl
    {
        private readonly ObservableCollection<TConsoleControl> Controls = new ObservableCollection<TConsoleControl>();
        public TConsoleControl ActiveControl { get; private set; }
        public int ActiveControlIndex { get; private set; }


        private int GetNewIndex()
        {
            // todo : intelligent free control index finder
            return Controls.Count;
        }

        public void ActivateLastControl()
        {
            if (ActiveControl == null && Controls.Count > 0)
            {
                if (Controls[0].CanActivate)
                    ActivateControl(Controls[0]);
                else if (Controls.Count > 1 && Controls[1].CanActivate)
                    ActivateControl(Controls[1]);
                else if (Controls.Count > 2 && Controls[2].CanActivate)
                    ActivateControl(Controls[2]);
            }
        }
        public void ActivateControl(TConsoleControl consoleControl)
        {
            if (ActiveControl != null)
            {
                ActiveControl.Desactivate();
            }
            consoleControl.Activate();
            ActiveControl = consoleControl;
            ActiveControlIndex = ActiveControl.Index;
        }

        public bool PreviousControl(int jump = 1)
        {
            var newindex = ActiveControlIndex - jump;
            if (newindex < 0) return false;
            var control = Controls.FirstOrDefault(item => item.Index == newindex);
            if (control == null) return PreviousControl(jump + 1);
            if (!control.CanActivate) return PreviousControl(jump + 1);
            ActivateControl(control);
            return true;
        }
        public bool NextControl(int jump = 1)
        {
            var newindex = ActiveControlIndex + jump;
            if (newindex > Controls.Count) return false;
            var control = Controls.FirstOrDefault(item => item.Index == newindex);
            if (control == null) return NextControl(jump + 1);
            if (!control.CanActivate) return NextControl(jump + 1);
            ActivateControl(control);
            return true;
        }

        public bool Interterpret(ConsoleKeyInfo key, ConsoleCommand command)
        {
            return ActiveControl != null && ActiveControl.Interterpret(key, command);
        }

        public void ShowError(Exception ex)
        {
            if (ActiveControl != null)
                ActiveControl.ShowError(ex);
        }

        public void AddControl(TConsoleControl control)
        {
            Controls.Add(control);
            control.Index = GetNewIndex();
        }
        public bool RemoveControl(TConsoleControl control)
        {
            return Controls.Remove(control);
        }

    }
}
