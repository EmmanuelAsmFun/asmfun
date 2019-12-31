#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.WPF.EnvTools;
using System;
using System.Windows;

namespace AsmFun.WPF.TheWPF
{

    /// <summary>
    /// Interaction logic for RootHiddenWindow.xaml
    /// </summary>
    public partial class RootHiddenWindow : Window
    {
        internal IEmServiceResolverFactory Container { get; set; }
        MainWindow mainWindow;
        public RootHiddenWindow()
        {
            InitializeComponent();
            FileSelectorPopup.Window = this;
        }

      
        public void OpenMainWindow()
        {
            Dispatcher.Invoke(() =>
            {
                mainWindow = new MainWindow();
                mainWindow.Container = Container;
                mainWindow.Show();
            });
        }

        internal void RequestClose()
        {
            Dispatcher.Invoke(() =>
            {
                mainWindow?.Close();
                Close();
            });
        }
    }
}
