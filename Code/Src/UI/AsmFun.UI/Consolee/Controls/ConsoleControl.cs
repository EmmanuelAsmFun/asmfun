#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Core;
using System;

namespace AsmFun.UI.Consolee.Controls
{
    public interface IConsoleControl
    {
        bool IsActive { get; }
        int Index { get; set; }
        ConsoleControl Parent { get; set; }
        IConsoleCommandManager CommandManager { get; set; }
        void ShowError(Exception ex);
        void Dispose();
        void Create();
        void Init();
        void Activate();
        void Desactivate();
        void Start();
        void Stop();
        void Redraw();
        bool Interterpret(ConsoleKeyInfo key, ConsoleCommand command);
        bool CanActivate { get; }
    }

    public class ConsoleControl : IDisposable, IConsoleControl
    {

        #region Properties
        public bool IsCreated { get; private set; }
        public bool IsInit { get; private set; }
        public bool IsRunning { get; private set; }
        public bool IsActive { get; private set; }
        public bool CanActivate { get; protected set; }

      

        public bool IsDisposing { get; private set; }
        public bool IsDisposed { get; private set; }
        public int Index { get; set; }
        public ConsoleControl Parent { get; set; }
        public IConsoleCommandManager CommandManager { get; set; }
        #endregion
        public ConsoleControl()
        {
            CanActivate = true;
        }

        #region CreationLifeCycle
        public void Create()
        {
            if (IsCreated) return;
            OnCreate();
            IsCreated = true;
        }
        protected virtual void OnCreate() { }
        public void Init()
        {
            if (IsInit) return;
            OnInit();
            IsInit = true;
        }
        protected virtual void OnInit() { }

        public void Activate()
        {
            if (IsActive) return;
            IsActive = true;
            OnActivatedChanged(IsActive);
        }
        public void Desactivate()
        {
            if (IsActive == false) return;
            IsActive = false;
            OnActivatedChanged(IsActive);
        }
        protected virtual void OnActivatedChanged(bool newState)
        {

        }
        public void Start()
        {
            if (IsRunning) return;
            OnStart();
            IsRunning = true;
        }
        protected virtual void OnStart() { }
        public void Stop()
        {
            Desactivate();
            if (!IsRunning) return;
            OnStop();
            IsRunning = false;
        }
        protected virtual void OnStop() { }
        public void Redraw()
        {
            if (IsDisposing || IsDisposed) return;
            OnRedraw();
        }

        public void Dispose()
        {
            IsDisposing = true;
            Stop();
            OnDispose();
            IsDisposed = true;
            IsDisposing = false;
        }

        protected virtual void OnDispose() { }

        protected virtual void OnRedraw() { }
        #endregion



        public bool Interterpret(ConsoleKeyInfo key, ConsoleCommand command)
        {
            if (IsDisposing || IsDisposed) return false;
            return OnInterterpret(key, command);
        }
        protected virtual bool OnInterterpret(ConsoleKeyInfo key, ConsoleCommand command)
        {
            return false;
        }
        public void ShowError(Exception ex)
        {
            if (IsDisposing || IsDisposed) return;
            OnShowError(ex);
        }
        protected virtual void OnShowError(Exception ex) { }

        public T GetSingleControl<T>()
            where T : ConsoleControl
        {
            //return Factory.GetSingleControl<T>();
            return default(T);
        }
    }
}
