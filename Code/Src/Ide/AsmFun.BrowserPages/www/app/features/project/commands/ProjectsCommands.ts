// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IProjectDetail, IProjectSettings, ISettings, IUserSettings } from '../data/ProjectData.js';
import { BaseCommand } from '../../../framework/commands/CommandsCommon.js';
import { IEditorBundle } from '../../editor/data/EditorData.js';
import { BaseEvent } from '../../../framework/data/EventsCommon.js';


export class ProjectSaveCommand extends BaseCommand{

    public constructor() {
        super();
        this.commandName = "Save";
        this.nameSpace = "Project";
    }
}
export class ProjectLoadCommand extends BaseCommand{
    public constructor() {
        super();
        this.commandName = "Load";
        this.nameSpace = "Project";
    }
}
export class ProjectOpenProjectWebsiteCommand extends BaseCommand{
    public detail: IProjectDetail | null;

    public constructor(detail: IProjectDetail | null = null) {
        super();
        this.detail = detail;
        this.commandName = "OpenProjectWebsite";
        this.nameSpace = "Project";
    }
}
export class ProjectLoadLocalCommand extends BaseCommand{
    public detail: IProjectDetail | null;

    public constructor(detail: IProjectDetail | null = null) {
        super();
        this.detail = detail;
        this.commandName = "LoadLocal";
        this.nameSpace = "Project";
    }
}
export class ProjectLoadWebCommand extends BaseCommand{
    public detail: IProjectDetail | null;

    public constructor(detail: IProjectDetail | null = null) {
        super();
        this.detail = detail;
        this.commandName = "LoadWeb";
        this.nameSpace = "Project";
    }
}
export class ProjectSettingsLoaded extends BaseEvent {
    public projectSettings: IProjectSettings | null;

    public constructor(projectSettings: IProjectSettings | null = null) {
        super();
        this.projectSettings = projectSettings;
        this.eventName = "Loaded";
        this.nameSpace = "Project";
    }
}
export class UserSaveUserSettingsCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "Save";
        this.nameSpace = "UserSettings";
    }
}
export class UserSettingsLoaded extends BaseEvent {
    public userSettings: IUserSettings | null;

    public constructor(userSettings: IUserSettings | null = null) {
        super();
        this.userSettings = userSettings;
        this.eventName = "Loaded";
        this.nameSpace = "UserSettings";
    }
}

export class ProjectRequestCreateNewCommand extends BaseCommand{

    public constructor() {
        super();
        this.commandName = "RequestCreateNew";
        this.nameSpace = "Project";
    }
}
export class ProjectCreateNewCommand extends BaseCommand{

    public constructor() {
        super();
        this.commandName = "CreateNew";
        this.nameSpace = "Project";
    }
}
export class ProjectRequestLoadProgramCommand extends BaseCommand{

    public constructor() {
        super();
        this.commandName = "RequestLoadProgram";
        this.nameSpace = "Project";
    }
}
export class ProjectSaveFolderCommand extends BaseCommand{

    public constructor() {
        super();
        this.commandName = "SaveFolder";
        this.nameSpace = "Project";
    }
}
export class ProjectOpenManagerCommand extends BaseCommand{
    public state: boolean | null;
    public constructor(state:boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Project";
    }
}