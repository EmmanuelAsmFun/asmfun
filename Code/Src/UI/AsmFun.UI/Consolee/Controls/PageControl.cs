#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Core;
using AsmFun.UI.Consolee.Data;
using AsmFun.UI.Consolee.UI;
using System;

namespace AsmFun.UI.Consolee.Controls
{
    public class PageControl : ConsoleControl
    {
        private ConsoleAskTextControl askText;
        private ControlActivationManager<IConsolePageControl> ControlManager { get; set; }
        public string Title { get; set; }
        public string SubTitle { get; set; }
        public ConsolePageUI PageUI { get; set; }
       
        protected override void OnCreate()
        {
            base.OnCreate();
            ControlManager = new ControlActivationManager<IConsolePageControl>();
            PageUI = new ConsolePageUI(new ConsoleStyleSheet());
        }

     
        protected override void OnActivatedChanged(bool newState)
        {
            base.OnActivatedChanged(newState);
            if (newState)
            {
                if (!IsInit || !IsCreated) return;
                PageUI.PageTitle = Title;
                PageUI.PageHeader = SubTitle;
                PageUI.Redraw();
                ControlManager.ActivateLastControl();
            }
        }


        private void PrepareControl(IConsolePageControl control)
        {
            control.Page = this;
            control.PageUI = PageUI;
            ControlManager.AddControl(control);
        }
        private void RemoveControl(IConsolePageControl control)
        {
            ControlManager.RemoveControl(control);
            control.Dispose();
        }
        protected override bool OnInterterpret(ConsoleKeyInfo key, ConsoleCommand command)
        {
            if (ControlManager.Interterpret(key, command)) return true;
            if (base.OnInterterpret(key, command)) return true;
            switch (command)
            {
                case ConsoleCommand.Redraw: PageUI.Redraw(); return true;
                case ConsoleCommand.Left: ControlManager.PreviousControl(); return true;
                case ConsoleCommand.Right: ControlManager.NextControl(); return true;
            }
            return false;
        }

        internal void CloseAskParameter()
        {
            ControlManager.ActivateControl(lastActivatedControl);
            RemoveControl(askText);
            askText = null;
            PageUI.HideAskParameter();
            PageUI.Redraw();
        }
        protected override void OnRedraw()
        {
            base.OnRedraw();
            PageUI.Redraw();
        }

        public void RequestActivation(IConsolePageControl consoleControl)
        {
            ControlManager.ActivateControl(consoleControl);
        }

        protected override void OnShowError(Exception ex)
        {
            PageUI.WriteError(ex.Message);
        }

        private IConsolePageControl lastActivatedControl;
        public void AskParameter<T>(string title, string question,IConsoleMenuItemData method, Action<IConsoleMenuItemData, AskResponse<T>> respondedMethod)
        {
            
            lastActivatedControl = ControlManager.ActiveControl;
            if (askText == null)
            {
                askText = new ConsoleAskTextControl();
                PrepareControl(askText);
            }
            askText.Ask(title, question, method, (Action<IConsoleMenuItemData, AskResponse<string>>)respondedMethod);
        }
      
    }
}
