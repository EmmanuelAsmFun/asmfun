// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Action2, Dictionary } from '../common/System.js'
import { ICommandEvent, ICommandSubscription, ICommandManager } from './ICommandManager.js'
import { IBaseCommand, BaseCommand, ICommandType } from '../data/commands/CommandsCommon.js';

/** Meditor item used internaly only. */
class CommandItem {
    public nameSpace: string = "";
    public commandName: string = "";
    public Subscriptions: CommandSubscription[] = new Array<CommandSubscription>();
}

/** Command event is propagated when an event is fired to be able to stop the propagation. */
class MCommandEvent implements ICommandEvent {
    public ContinuePropagation: boolean = false;
    constructor() { }
}

/** Class to subscribe to event types. It's used to communicate between multiple viewModels. */
export class CommandManager implements ICommandManager {

    private _items: Dictionary<CommandItem> = new Dictionary<CommandItem>();

    /** Subscribes to a command. Pass an empty command as the first parameter with the namespace and commandname filled. */
    public Subscribe2<T extends IBaseCommand>(command: T, callerObj: object, action: Action2<T, ICommandEvent>): ICommandSubscription {
        var type = command.GetType();
        var subscription = this.SubscribeByName(type.nameSpace, type.commandName, callerObj, action);
        return subscription;
    }
    public Subscribe2At<T extends IBaseCommand>(index: number, command: T, callerObj: object, action: Action2<T, ICommandEvent>): ICommandSubscription {
        var type = command.GetType();
        var subscription = this.SubscribeByNameAt(index, type.nameSpace, type.commandName, callerObj, action);
        return subscription;
    }

    /** Subscribes to a command. Pass an empty command as the first parameter with the namespace and commandname filled. */
    public Subscribe<T extends IBaseCommand>(commandType: ICommandType, callerObj: object,  action: Action2<T, ICommandEvent>): ICommandSubscription {
        var subscription = this.SubscribeByName(commandType.nameSpace, commandType.commandName, callerObj, action);
        return subscription;
    }
    public SubscribeAt<T extends IBaseCommand>(index: number, commandType: ICommandType, callerObj: object, action: Action2<T, ICommandEvent>): ICommandSubscription {
        var subscription = this.SubscribeByNameAt(index, commandType.nameSpace, commandType.commandName, callerObj, action);
        return subscription;
    }
     /** Subscribes to a command. */
    public SubscribeByName<T extends IBaseCommand>(nameSpace: string, commandName: string, callerObj: object, action: Action2<T, ICommandEvent>): ICommandSubscription {
        return this.SubscribeByNameAt(-1, nameSpace, commandName, callerObj, action);
    }
    public SubscribeByNameAt<T extends IBaseCommand>(index: number,nameSpace: string, commandName: string, callerObj: object,  action: Action2<T, ICommandEvent>): ICommandSubscription {
        var subscription = new CommandSubscription(this, action, nameSpace, commandName, callerObj);
        var fullName = subscription.getFullName();
        if (this._items.containsKey(fullName)) {
            var item = this._items.getItem(fullName);
            if (item != null) {
                if (index > -1 && index < item.Subscriptions.length)
                    item.Subscriptions.splice(index,0,subscription);
                else
                    item.Subscriptions.push(subscription);
            }
        } else {
            var itemNew = new CommandItem();
            itemNew.Subscriptions.push(subscription);
            this._items.add(fullName, itemNew);
        }
        return subscription;
    }

    /** Unsubscribes to a command type . */
    public Unsubscribe(subscription: ICommandSubscription) {
        var fullName = subscription.getFullName();
        if (!this._items.containsKey(fullName)) return;
        var item = this._items.getItem(fullName);
        if (item == null) return;
        var index = item.Subscriptions.indexOf(<CommandSubscription>subscription);
        if (index < 0) return;
        item.Subscriptions.splice(index, 1);
        if (item.Subscriptions.length === 0)
            this._items.remove(fullName);
        subscription.IsDeleted = true;
    }


    /** Fire a command. */
    public InvokeCommand(command: IBaseCommand) {
        var fullName = command.getFullName();
        if (!this._items.containsKey(fullName)) return;
        var item = this._items.getItem(fullName);
        if (item == null) throw "command not found";
        var CommandEvent = new MCommandEvent();
        CommandEvent.ContinuePropagation = true;
        for (var i = 0; i < item.Subscriptions.length; i++) {
            var subscription = item.Subscriptions[i];
            subscription.Invoke(command, CommandEvent);
            if (!CommandEvent.ContinuePropagation) break;
        }
    }

    /** Disposes this instance with all the subscriptions. */
    public Dispose() {
        this._items._values.forEach(x => {
            x.Subscriptions.forEach(s => {
                s.Dispose();
            });
        });
    }
}


/** A subscription to the Command. */
class CommandSubscription implements ICommandSubscription {
    /** The action to execute. */
    private Action: any; // Action2<IBaseCommand, ICommandEvent>;
    /** The nameSpace. */
    public nameSpace: string;
    /** The name of the command */
    public commandName: string;
    /** If this subscription is deleted. */
    public IsDeleted: boolean = false;
    /** The meditator object. */
    private _commandObj: CommandManager;
    private callerObj: any;

    constructor(Command: CommandManager, action, nameSpace: string, commandName: string, callerObj:object) {
        this._commandObj = Command;
        this.Action = action;
        this.nameSpace = nameSpace;
        this.commandName = commandName;
        this.callerObj = callerObj;
    }
    public Invoke(command: IBaseCommand, evt: ICommandEvent) {
        this.Action.apply(this.callerObj,[ command, evt]);
        // this.callerObj.call[this.Action(command,evt)];
    }
    public getFullName() {
        return this.nameSpace + "." + this.commandName;
    }

    /** Delete this subsciption. */
    public Dispose() {
        this._commandObj.Unsubscribe(this);
    }
}




