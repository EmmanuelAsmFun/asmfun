import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";

export class FindReplaceSearchNextCommand extends BaseCommand {

    public constructor() {
        super();
        this.commandName = "SearchNext";
        this.nameSpace = "FindReplace";
    }
}

export class FindReplaceReplaceNextCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "ReplaceNext";
        this.nameSpace = "FindReplace";
    }
}
export class FindReplaceOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "ReplaceNext";
    }
}

