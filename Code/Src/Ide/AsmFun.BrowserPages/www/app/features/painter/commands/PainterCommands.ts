import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";

export class PainterOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Painter";
    }
}
export class PainterSelectToolCommand extends BaseCommand {
    public toolName: string | null;
    public constructor(toolName: string | null) {
        super();
        this.toolName = toolName;
        this.commandName = "SelectTool";
        this.nameSpace = "Painter";
    }
}