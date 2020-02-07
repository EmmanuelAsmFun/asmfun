import { BaseCommand } from './CommandsCommon.js'

export class PainterOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Painter";
    }
}