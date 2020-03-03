import { IZoneManager } from "./data/IZoneManager.js";
import { IZoneData, IUIZonesData, NewUIZonesData, IUIZone } from "./data/IZonesData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { InterpreterLine } from "./interpreters/InterpreterLine.js";
import { NavCollection } from "./NavCollection.js";

export class ZoneManager implements IZoneManager {

    private collection: NavCollection<IZoneData, IUIZone>;
    public Ui: IUIZonesData = NewUIZonesData();

    public constructor() {
        this.collection = new NavCollection<IZoneData, IUIZone>();
    }

    public SetUIData(uiData: IUIZonesData) {
        this.Ui = uiData;
        this.collection.SetUIData(uiData);
    }

    public AddZone(line: IInterpretLine, name: string): IZoneData {
        var cleanName = name.replace(":", "");
        var dirtyName = name;
        // Check if it already exists
        var zone = this.collection.Find(cleanName);
        if (zone != null) {
            // Update Zone
            zone.Line = line;
            return zone;
        }
        zone = this.NewZone(cleanName, line);
        this.collection.Add(zone);
        zone.DirtyName = dirtyName;
        return zone;
    }

    public Reset() {
        this.collection.Reset();
    }
    public ParseAddress(name: string, addressNum: number) {
        this.collection.ParseAddress(name, addressNum);
    }
    public AddUsedBy(zone: IZoneData, lineI: InterpreterLine) {
        this.collection.AddUsedBy(zone, lineI);
    }
    public RemoveZone(zone: IZoneData) {
        this.collection.Remove(zone, i => i.ZoneLink = null);
    }
    public RemoveZoneByName(name: string) {
        this.collection.RemoveByName(name, i => i.ZoneLink = null);
    }
    public Find(zoneName: string): IZoneData | null {
        return this.collection.Find(zoneName);
    }
    public FindByAddress(address: number): IZoneData | null {
        return this.collection.FindByAddress(address);
    }
    public FindByHexAddress(hexAddress: string): IZoneData | null {
        return this.collection.FindByHexAddress(hexAddress);
    }
    public GetAll() {
        return this.collection.GetAll();
    }

    private NewZone(name: string, line: IInterpretLine): IZoneData {
        return {
            AddressNum: 0,
            DirtyName: name,
            Line: line,
            UsedByLines: [],
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
                Hilite: false,
                UsedByLines: [],
                ShowUsedBy: false,
            }
        };
    }


}