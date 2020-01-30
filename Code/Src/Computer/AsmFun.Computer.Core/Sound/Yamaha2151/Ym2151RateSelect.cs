namespace AsmFun.Computer.Core.Sound.Yamaha2151
{
    /// <summary>
    /// Envelope Generator rates (32 + 64 rates + 32 RKS)
    /// that there is no O(17) in this table - it's directly in the code 
    /// </summary>
    public class Ym2151RateSelect
    {
        private static byte RATE_STEPS2;
        private static byte O(int a) => (byte)(a * RATE_STEPS2);

        public static byte[] Create(byte RATE_STEPS)
        {
            RATE_STEPS2 = RATE_STEPS;
            var data = new byte[32 + 64 + 32] { //Envelope Generator rates  (32 + 64 rates + 32 RKS)
                /* 32 dummy (infinite time) rates */
                O(18),O(18),O(18),O(18),O(18),O(18),O(18),O(18),
                O(18),O(18),O(18),O(18),O(18),O(18),O(18),O(18),
                O(18),O(18),O(18),O(18),O(18),O(18),O(18),O(18),
                O(18),O(18),O(18),O(18),O(18),O(18),O(18),O(18),

                /* rates 00-11 */
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),
                O( 0),O( 1),O( 2),O( 3),

                /* rate 12 */
                O( 4),O( 5),O( 6),O( 7),

                /* rate 13 */
                O( 8),O( 9),O(10),O(11),

                /* rate 14 */
                O(12),O(13),O(14),O(15),

                /* rate 15 */
                O(16),O(16),O(16),O(16),

                /* 32 dummy rates (same as 15 3) */
                O(16),O(16),O(16),O(16),O(16),O(16),O(16),O(16),
                O(16),O(16),O(16),O(16),O(16),O(16),O(16),O(16),
                O(16),O(16),O(16),O(16),O(16),O(16),O(16),O(16),
                O(16),O(16),O(16),O(16),O(16),O(16),O(16),O(16)

            };
            return data;
        }
    }
}
