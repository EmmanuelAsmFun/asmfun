using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video.Painter
{
    public static class PainterCalculations
    {
        public static int CalcLayerEffX(VideoLayerData props, int x)
        {
            return (x + props.HorizontalScroll) & (props.LayerWidthMax);
        }

        public static int CalcLayerEffY(VideoLayerData layer, ushort y)
        {
            return (y + layer.VerticalScroll) & (layer.LayerHeightMax);
        }

        public static uint CalcLayerMapAddress(VideoLayerData props, int eff_x, int eff_y)
        {
            var h = props.TileHeight;
            var w = props.TileWidth;
            if (w == 0 || h == 0) return 0;
            return (uint)(props.MapBase + (eff_y / h * props.MapWidth + eff_x / w) * 2);
        } 
        public static uint CalcLayerMapAddress2(VideoLayerData props, int eff_x, int eff_y)
        {
            var h = props.TileHeight;
            var w = props.TileWidth;
            if (w == 0 || h == 0) return 0;
            return (uint)((eff_y / h * props.MapWidth + eff_x / w) * 2);
        }


        public static int CalcLayerEffX(ushort hScroll, ushort layerWidthMax, int x)
        {
            return (x + hScroll) & layerWidthMax;
        }

        public static int CalcLayerEffY(ushort vScroll, ushort layerHeightMax, ushort y)
        {
            return (y + vScroll) & layerHeightMax;
        }


        public static uint CalcLayerMapAddress(ushort w, ushort h, ushort mw, int eff_x, int eff_y)
        {
            if (w == 0 || h == 0) return 0;
            return (uint)((eff_y / h * mw + eff_x / w) * 2);
        } 
       
    }
}
