
export interface IPaletteData {
    colors: IPaletteColor[];
    selectedColor: IPaletteColor | null;
    changeColor: (color: IPaletteColor) => void;
}

export interface IPaletteColor {
    colorNumber: number;
    colorRGB: string;
    colorHex: string;
    r: number, g: number, b: number,
    index: number;
}
export function NewPalette(): IPaletteData {
    return {
        colors: [],
        selectedColor: null,
        changeColor: () => { },
    }
}

export function NewEmptyColor(): IPaletteColor {
    return { colorHex: "#000000", colorNumber: 0, colorRGB: "0,0,0", r: 0, g: 0, b: 0, index: 0 };
}