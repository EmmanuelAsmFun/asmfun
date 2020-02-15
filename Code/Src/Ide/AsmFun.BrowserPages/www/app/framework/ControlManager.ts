// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IControlManager } from './IControlManager.js'
import { IUIControl } from './IUIControl.js'
import { ServiceName } from './serviceLoc/ServiceName.js';


class ControlItem {
    public Control: IUIControl;
    constructor(control: IUIControl) {
        this.Control = control;
    }
}

export class ControlManager implements IControlManager {

    private _items: ControlGroup[] = [];

    public Activate(control: IUIControl) {
        var group = this.GetGroup(control.GetControlGroup());
        for (var i = 0; i < group.Controls.length; i++) {
            var item = group.Controls[i];
            if (item.Control !== control)
                item.Control.DeactivateControl();
            else
                item.Control.ActivateControl();
        }
    }

    public Subscribe(control: IUIControl) {

        var group = this.GetGroup(control.GetControlGroup());
        group.Subscribe(control);
    }

    public Unsubscribe(control: IUIControl) {
        var group = this.GetGroup(control.GetControlGroup());
        group.Unsubscribe(control);
    }

    private GetGroup(groupName: string): ControlGroup {
        var itemIndex = this._items.findIndex(x => x.GroupName === groupName);
        if (itemIndex < 0) {
            var group = new ControlGroup(groupName);
            this._items.push(group)
            return group;
        }
        return this._items[itemIndex];
    }
    

    public Dispose() {
        this._items = [];
    }

    public static ServiceName: ServiceName = new ServiceName("ControlManager");
}


class ControlGroup {
    public GroupName: string = "";
    public Controls: ControlItem[] = [];

    constructor(groupName: string) {
        this.GroupName = groupName;
    }

    public Subscribe(control: IUIControl) {

        var item: ControlItem = new ControlItem(control);
        this.Controls.push(item);
    }

    public Unsubscribe(control: IUIControl) {
        var itemIndex = this.Controls.findIndex(x => x.Control === control);
        if (itemIndex > -1)
            this.Controls.splice(itemIndex, 1);
    }
}


