import { IZoneManager } from "./data/IZoneManager.js";
import { IZoneData, IUIZonesData, NewUIZonesData } from "./data/IZonesData.js";
import { AsmTools, AsmString } from "../../Tools.js";
import { IInterpretLine } from "./data/InterpreterData.js";

export class ZoneManager implements IZoneManager {

    private zones: IZoneData[] = [];

    public Ui: IUIZonesData = NewUIZonesData();

    public SetUIData(uiData: IUIZonesData) {
        this.Ui = uiData;
        this.Ui.List = [];
        for (var i = 0; i < this.zones.length; i++) 
            this.Ui.List.push(this.zones[i].Ui);
        this.Ui.SearchChanged = () => {
            var search = AsmString.CleanSearch(this.Ui.Search);
            this.Ui.List = this.zones.filter(x => AsmString.CompareInsensitive(x.Ui.Name, search)).map(x => x.Ui);
        }
    }

    public Reset() {
        this.zones = [];
        this.Ui.List = [];
    }

    public AddZone(line: IInterpretLine, zoneName: string): IZoneData {
        var cleanName = zoneName.replace(":", "");
        var dirtyName = zoneName;
        // Check if it already exists
        var zone = this.zones.find(x => x.Ui.Name == cleanName);
        if (zone != null) {
            // Update Zone
            zone.Line = line;
            return zone;
        }
        // New Zone
        zone = this.CreateZone(cleanName, line);
        zone.DirtyName = dirtyName;
        return zone;
    }

    public CreateZone(name: string, line: IInterpretLine): IZoneData {
        var zone = this.NewZone(name, line);
        this.zones.push(zone);
        this.Ui.List.push(zone.Ui);
        return zone;
    }

    public ParseAddress(name: string, addressNum: number) {
        var zoneIndex = this.zones.findIndex(x => x.Ui.Name === name);
        if (zoneIndex < 0) return;
        var zone = this.zones[zoneIndex];
        zone.AddressNum = addressNum;
        zone.Ui.Address = AsmTools.numToHex5(addressNum);
    }

    public RemoveZone(zone: IZoneData) {
        var zoneIndex = this.zones.findIndex(x => x === zone);
        if (zoneIndex > -1) this.zones.splice(zoneIndex, 1);
        zoneIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (zoneIndex > -1) this.Ui.List.splice(zoneIndex, 1);
    }
    public RemoveZoneByName(name: string) {
        var zoneIndex = this.zones.findIndex(x => x.Ui.Name === name);
        if (zoneIndex > -1) this.zones.splice(zoneIndex, 1);
        zoneIndex = this.Ui.List.findIndex(x => x.Name === name);
        if (zoneIndex > -1) this.Ui.List.splice(zoneIndex, 1);
    }

    public Find(name: string): IZoneData | null {
        var item = this.zones.find(x => x.Ui.Name === name);
        return item != undefined ? item : null;
    }
    public FindByAddress(address: number): IZoneData | null {
        var lbl = this.zones.find(x => x.AddressNum === address);
        return lbl != undefined ? lbl : null;
    }
    public FindByHexAddress(hexAddress: string): IZoneData | null {
        var lbl = this.zones.find(x => x.Ui.Address === hexAddress);
        return lbl != undefined ? lbl : null;
    }

    public GetAll() {
        return this.zones;
    }

    private NewZone(name: string, line: IInterpretLine): IZoneData {
        return {
            AddressNum: 0,
            DirtyName: name,
            Line: line,
            Ui: {
                Name: name,
                Address: "",
                LineNumber: line.LineNumber,
                FileIndex: line.Ui.FileIndex,
            }
        };
    }


}