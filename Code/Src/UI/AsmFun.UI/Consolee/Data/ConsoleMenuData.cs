#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Controls;
using AsmFun.UI.Consolee.UI;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace AsmFun.UI.Consolee.Data
{
    public interface IConsoleMenuData
    {
        string Title { get; set; }
        bool IsRoot { get; set; }
        int MenuDepth { get; set; }
        ConsoleMenuData Parent { get; set; }
    }

    public class ConsoleMenuData : ObservableCollection<ConsoleMenuItemData>, IConsoleMenuData
    {
        public ConsoleVMenuUI ConsoleVMenuUI { get; set; }

        protected Dictionary<string, ConsoleMenuItemData> MethodShortcuts { get; set; }
        public string Title { get; set; }
        public bool IsRoot { get; set; }
        public int MenuDepth { get; set; }
        public int LastSelectedIndex { get; private set; }
        public bool IsActivated { get; private set; }
        public ConsoleMenuData Parent { get; set; }


        public ConsoleMenuItemData this[string shortcut]
        {
            get { return MethodShortcuts[shortcut]; }
        }

        public ConsoleMenuData()
        {
            MethodShortcuts = new Dictionary<string, ConsoleMenuItemData>();
            LastSelectedIndex = -1;
            CollectionChanged += ConsoleMenuData_CollectionChanged;
        }


        #region List Add /Remove/Insert
        public new void Add(ConsoleMenuItemData consoleMenuItemData)
        {
            MethodShortcuts.Add(consoleMenuItemData.Id, consoleMenuItemData);
            base.Add(consoleMenuItemData);

        }
        public new void Insert(int index, ConsoleMenuItemData consoleMenuItemData)
        {
            MethodShortcuts.Add(consoleMenuItemData.Id, consoleMenuItemData);
            base.Insert(index, consoleMenuItemData);
        }
        public new void Remove(ConsoleMenuItemData consoleMenuItemData)
        {
            MethodShortcuts.Remove(consoleMenuItemData.Id);
            base.Remove(consoleMenuItemData);
        }
        public bool Contains(string shortcut)
        {
            return MethodShortcuts.ContainsKey(shortcut);
        }
        #endregion

        #region Selection
        public void SelectedLast()
        {
            if (Count == 0) return;
            if (LastSelectedIndex == -1) LastSelectedIndex = 0;
            Items[LastSelectedIndex].IsSelected = true;
            UpdateListUI(new[] { LastSelectedIndex });
        }
        public void DeselectAll()
        {
            foreach (var item in this)
                item.IsSelected = false;
            UpdateListUI();
        }
        public void SelectUp(int jump = 1)
        {
            ConsoleMenuItemData selectedItem;
            if (GetSelectedAndSelect(out selectedItem)) return;
            var index = Items.IndexOf(selectedItem);
            if (index - jump < 0)
            {
                jump = index;
            }
            if (index - jump < 0)
            {
                Items[index].IsSelected = true;
                LastSelectedIndex = index;
                UpdateListUI(new[] { index });
                return;
            }
            Items[index - jump].IsSelected = true;
            UpdateListUI(new[] { LastSelectedIndex, index - jump });
            LastSelectedIndex = index - jump;

        }
        public void SelectDown(int jump = 1)
        {
            ConsoleMenuItemData selectedItem;
            if (GetSelectedAndSelect(out selectedItem)) return;
            var index = Items.IndexOf(selectedItem);
            if (index >= Items.Count - jump)
                jump = Items.Count - index - 1;
            if (index >= Items.Count - jump)
            {
                Items[index].IsSelected = true;
                LastSelectedIndex = index;
                UpdateListUI(new[] { index });
                return;
            }
            Items[index + jump].IsSelected = true;
            UpdateListUI(new[] { LastSelectedIndex, index + jump });
            LastSelectedIndex = index + jump;
        }
        public ConsoleMenuItemData GetSelected()
        {
            return Items.FirstOrDefault(item => item.IsSelected);
        }

        private bool GetSelectedAndSelect(out ConsoleMenuItemData selectedItem)
        {
            selectedItem = Items.FirstOrDefault(item => item.IsSelected);
            if (selectedItem == null && LastSelectedIndex == -1)
            {
                if (Items.Count == 0)
                {
                    return true;
                }
                Items[0].IsSelected = true;
                selectedItem = Items[0];
                LastSelectedIndex = 0;
                UpdateListUI(new[] { 0 });
                return true;
            }
            if (selectedItem == null)
            {
                Items[LastSelectedIndex].IsSelected = true;
                selectedItem = Items[LastSelectedIndex];
                UpdateListUI(new[] { LastSelectedIndex });
                return true;
            }
            selectedItem.IsSelected = false;
            return false;
        }
        #endregion


        public void Activate() { SetActive(true); }
        public void Desactivate() { SetActive(false); }

        private void SetActive(bool state)
        {
            IsActivated = state;
            foreach (var consoleMenuItemData in Items)
                consoleMenuItemData.IsActivated = state;
            if (ConsoleVMenuUI != null)
                ConsoleVMenuUI.DrawMenuItems(new[] { LastSelectedIndex });
        }

        public virtual bool Interterpret(ConsoleCommand command)
        {
            if (command == ConsoleCommand.Up) { SelectUp(); return true; }
            if (command == ConsoleCommand.Down) { SelectDown(); return true; }
            if (command == ConsoleCommand.PageUp) { SelectUp(10); return true; }
            if (command == ConsoleCommand.PageDown) { SelectDown(10); return true; }
            if (command == ConsoleCommand.Confirm) { GetSelected().Action(); return true; }
            return false;
        }

        void ConsoleMenuData_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            try
            {
                UpdateListUI();
            }
            catch (Exception)
            {
            }
        }

        public bool WaitForDrawing { get; set; }
        private void UpdateListUI()
        {
            if (ConsoleVMenuUI == null) return;
            if (WaitForDrawing) return;
            ConsoleVMenuUI.Draw();
        }
        private void UpdateListUI(ICollection<int> listIndexes)
        {
            ConsoleVMenuUI.DrawMenuItems(listIndexes);
        }

        public void AddRangeOnce(List<ConsoleMenuItemData> menuItems)
        {
            WaitForDrawing = true;
            foreach (var consoleMenuItemData in menuItems)
                Add(consoleMenuItemData);
            WaitForDrawing = false;
            //UpdateListUI();

        }
    }
}
