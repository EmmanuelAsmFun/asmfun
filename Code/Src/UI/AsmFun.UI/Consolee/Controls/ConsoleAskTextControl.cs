#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Data;
using System;
using System.Text;

namespace AsmFun.UI.Consolee.Controls
{
    public class ConsoleAskTextControl : ControlAskControl
    {
        private int hPosition;
        private StringBuilder buf;
        private Action<IConsoleMenuItemData, AskResponse<string>> ResultMethod { get; set; }
        private IConsoleMenuItemData Method;
        public string ResultText { get; private set; }
        public string Question { get; set; }
        public string Title { get; set; }

        #region Ask parameter
        public void Ask(string title, string question, IConsoleMenuItemData method, Action<IConsoleMenuItemData, AskResponse<string>> resultMethod)
        {
            try
            {
                StartNewInput();
                ResultMethod = resultMethod;
                Method = method;
                Question = question;
                Title = title;
                hPosition = PageUI.StartInputPositionX;
                Page.RequestActivation(this);
            }
            catch (Exception ex)
            {
                PageUI.WriteError(ex.Message);
                if (ResultMethod != null)
                    ResultMethod(method, null);
            }

        }
        protected override void OnActivatedChanged(bool newState)
        {
            base.OnActivatedChanged(newState);
            if (newState)
            {

                PageUI.DrawAskParameter(Title, Question);
                //PageUI.DrawAskParameter(GetParameterName(method));
                //PageUI.DrawCommandName(method.BezCommandAttribute.CommandName);
                PageUI.RedrawInput();
                hPosition = PageUI.StartInputPositionX;
            }
        }

        #endregion
        protected override bool OnInterterpret(ConsoleKeyInfo key, ConsoleCommand command)
        {
            Console.CursorLeft = hPosition < PageUI.PageWidth ? hPosition : PageUI.PageWidth - 1;
            if (command == ConsoleCommand.Left || command == ConsoleCommand.Right)
            {
                return true;
            }
            if (command == ConsoleCommand.Quit || command == ConsoleCommand.Back)
            {
                Clean();
                if (ResultMethod != null)
                    ResultMethod(Method, null);
                base.Page.CloseAskParameter();
                return true;
            }
            switch (key.Key)
            {
                //case ConsoleKey.LeftArrow: SelectCommand(ConsoleCommand.Left, key); return false;
                //case ConsoleKey.RightArrow: SelectCommand(ConsoleCommand.Right, key); return false;
                case ConsoleKey.Escape:
                    Clean();
                    ResultMethod(Method, null);
                    return true;
                case ConsoleKey.Enter:
                    ResultText = buf.ToString();
                    var result = new AskResponse<string> { ResponseValue = ResultText };
                    if (ResultMethod != null)
                        ResultMethod(Method, result);
                    if (result.IsWrongInput)
                    {
                        Clean();
                        buf.Clear();
                        hPosition = PageUI.StartInputPositionX;
                        return true;
                    }
                    Clean();
                    base.Page.CloseAskParameter();
                    return true;
                case ConsoleKey.Delete:
                case ConsoleKey.UpArrow:
                case ConsoleKey.DownArrow:
                case ConsoleKey.RightArrow:
                    return true;
                case ConsoleKey.Backspace:
                    if (buf.Length < 1) return true;
                    buf.Remove(buf.Length - 1, 1);
                    Console.Write("\b \b");
                    if (hPosition > PageUI.StartInputPositionX)
                        hPosition--;
                    return true;
            }
            if (key.KeyChar != 0)
            {
                buf.Append(key.KeyChar);
                Console.Write(key.KeyChar);
                hPosition++;
                Console.CursorLeft = hPosition < PageUI.PageWidth ? hPosition : PageUI.PageWidth - 1;
                return true;
            }
            return base.OnInterterpret(key, command);
        }
        protected override void OnStop()
        {
            Clean();
            if (ResultMethod != null)
                ResultMethod(Method, null);
            ResultMethod = null;
            base.OnStop();
        }
        private void StartNewInput()
        {
            hPosition = PageUI.StartInputPositionX;
            buf = new StringBuilder();
            ResultText = "";
        }
        private void Clean()
        {
            ResultText = "";
            if (PageUI != null)
                PageUI.RedrawInput();
        }
        protected override void OnDispose()
        {
            ResultMethod = null;
            base.OnDispose();
        }
    }
}
