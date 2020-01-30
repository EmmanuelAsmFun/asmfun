namespace AsmFun.Computer.Core.Sound.Yamaha2151
{
    public class Ym2151RateShift
    {
        private static byte O(int a) => (byte)(a * 1);

        public static byte[] Create()
        {
            var data = new byte[32 + 64 + 32] {    /* Envelope Generator counter shifts (32 + 64 rates + 32 RKS) */
               /* 32 infinite time rates */
                O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),
                O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),
                O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),
                O(0),O(0),O(0),O(0),O(0),O(0),O(0),O(0),


                /* rates 00-11 */
                O(11),O(11),O(11),O(11),
                O(10),O(10),O(10),O(10),
                O( 9),O( 9),O( 9),O( 9),
                O( 8),O( 8),O( 8),O( 8),
                O( 7),O( 7),O( 7),O( 7),
                O( 6),O( 6),O( 6),O( 6),
                O( 5),O( 5),O( 5),O( 5),
                O( 4),O( 4),O( 4),O( 4),
                O( 3),O( 3),O( 3),O( 3),
                O( 2),O( 2),O( 2),O( 2),
                O( 1),O( 1),O( 1),O( 1),
                O( 0),O( 0),O( 0),O( 0),

                /* rate 12 */
                O( 0),O( 0),O( 0),O( 0),

                /* rate 13 */
                O( 0),O( 0),O( 0),O( 0),

                /* rate 14 */
                O( 0),O( 0),O( 0),O( 0),

                /* rate 15 */
                O( 0),O( 0),O( 0),O( 0),

                /* 32 dummy rates (same as 15 3) */
                O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),
                O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),
                O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),
                O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0),O( 0)

            };
            return data;
        }
    }
}

