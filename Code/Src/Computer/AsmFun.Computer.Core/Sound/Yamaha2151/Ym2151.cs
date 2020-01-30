using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Computer.Core.Sound.Yamaha2151
{
    public class Ym2151
    {
        private int YM_MONO = 1;
        private int YM_STEREO = 2;

        private int YM_LEFT = 0;
        private int YM_RIGHT = 1;


		public const double PI = 3.14159265358979323846;
		public const int FREQ_SH = 16; // 16.16 fixed point (frequency calculations)
		public const int EG_SH = 16; // 16.16 fixed point (envelope generator timing)
		public const int LFO_SH = 10; // 22.10 fixed point (LFO calculations)
		public const int TIMER_SH = 16; // 16.16 fixed point (timers calculations)
		public const int RATE_STEPS = 8;



		private const int FREQ_MASK = ((1 << FREQ_SH) - 1);

		private const int ENV_BITS = 10;
		private const int ENV_LEN = (1 << ENV_BITS);
		// Todo: possible error
		private const double ENV_STEP = (128.0 / ENV_LEN);

		private const int MAX_ATT_INDEX = (ENV_LEN - 1); /* 1023 */
		private const int MIN_ATT_INDEX = (0);         /* 0 */

		private const int EG_ATT = 4;
		private const int EG_DEC = 3;
		private const int EG_SUS = 2;
		private const int EG_REL = 1;
		private const int EG_OFF = 0;

		private const int SIN_BITS = 10;
		private const int SIN_LEN = (1 << SIN_BITS);
		private const int SIN_MASK = (SIN_LEN - 1);

		private const int TL_RES_LEN = (256); /* 8 bits addressing (real chip) */

		/* 16-Bit Sample Setup */
		private const int FINAL_SH = (0);
		private const int MAXOUT = (+32767);
		private const int MINOUT = (-32768);



		private int YM_initalized;

		// Sample Frequency in use
		private uint YM_sample_freq;

		// How many channels to support (mono/stereo)
		private byte YM_channels;

		private int YM_irq;

		// Frames per second
		private uint YM_fps;


		private uint YM_clock; //chip clock in Hz (passed from 2151intf.c)
		private int YM_sampfreq; //sampling frequency in Hz (passed from 2151intf.c)

		private int[] chanout = new int[8];
		private int m2; // Phase Modulation input for operators 2,3,4
		private int c1;
		private int c2;
		private int mem; // one sample delay memory

		private YM2151Operator[] oper; // the 32 operators

		private uint[] pan = new uint[16]; // channels output masks (0xffffffff = enable)

		private uint eg_cnt; // global envelope generator counter
		private uint eg_timer; // global envelope generator counter works at frequency = chipclock/64/3
		private uint eg_timer_add; // step of eg_timer
		private uint eg_timer_overflow; // envelope generator timer overlfows every 3 samples (on real chip)

		private uint lfo_phase; // accumulated LFO phase (0 to 255)
		private uint lfo_timer; // LFO timer
		private uint lfo_timer_add; // step of lfo_timer
		private uint lfo_overflow; // LFO generates new output when lfo_timer reaches this value
		private uint lfo_counter; // LFO phase increment counter
		private uint lfo_counter_add; // step of lfo_counter
		private byte lfo_wsel; // LFO waveform (0-saw, 1-square, 2-triangle, 3-random noise)
		private byte amd; // LFO Amplitude Modulation Depth
		private char pmd; // LFO Phase Modulation Depth
		private uint lfa; // LFO current AM output
		private int lfp; // LFO current PM output

		private byte test; // TEST register
		private byte ct; // output control pins (bit1-CT2, bit0-CT1)

		private uint noise; // noise enable/period register (bit 7 - noise enable, bits 4-0 - noise period
		private uint noise_rng; // 17 bit noise shift register
		private uint noise_p; // current noise 'phase'
		private uint noise_f; // current noise period

		private uint csm_req; // CSM  KEY ON / KEY OFF sequence request

		private uint irq_enable; // IRQ enable for timer B (bit 3) and timer A (bit 2); bit 7 - CSM mode (keyon to all slots, everytime timer A overflows)
		private uint status; // chip status (BUSY, IRQ Flags)
		private byte[] connects = new byte[8]; // channels connections

#if USE_MAME_TIMERS
/* ASG 980324 -- added for tracking timers */
	private emu_timer timer_A;
	private emu_timer timer_B;
	private attotime[] timer_A_time (1024); // timer A times for MAME
	private attotime[] timer_B_time (256); // timer B times for MAME
	private int irqlinestate;
#else
		private byte tim_A; // timer A enable (0-disabled)
		private byte tim_B; // timer B enable (0-disabled)
		private int tim_A_val; // current value of timer A
		private int tim_B_val; // current value of timer B
		private int[] tim_A_tab = new int[1024]; // timer A deltas
		private int[] tim_B_tab = new int[256]; // timer B deltas
#endif
		private uint timer_A_index; // timer A index
		private uint timer_B_index; // timer B index
		private uint timer_A_index_old; // timer A previous index
		private uint timer_B_index_old; // timer B previous index


		/*  Frequency-deltas to get the closest frequency possible.
		*   There are 11 octaves because of DT2 (max 950 cents over base frequency)
		*   and LFO phase modulation (max 800 cents below AND over base frequency)
		*   Summary:   octave  explanation
		*              0       note code - LFO PM
		*              1       note code
		*              2       note code
		*              3       note code
		*              4       note code
		*              5       note code
		*              6       note code
		*              7       note code
		*              8       note code
		*              9       note code + DT2 + LFO PM
		*              10      note code + DT2 + LFO PM
		*/
		private uint[] freq = new uint[11 * 768]; // 11 octaves, 768 'cents' per octave

		/*  Frequency deltas for DT1. These deltas alter operator frequency
		*   after it has been taken from frequency-deltas table.
		*/
		private int[] dt1_freq = new int[8 * 32]; // 8 DT1 levels, 32 KC values

		private uint[] noise_tab = new uint[32]; // 17bit Noise Generator periods







		/* 16-Bit Sample Setup */

		/*  TL_TAB_LEN is calculated as:
		*   13 - sinus amplitude bits     (Y axis)
		*   2  - sinus sign bit           (Y axis)
		*   TL_RES_LEN - sinus resolution (X axis)
		*/
		private const int TL_TAB_LEN = 13 * 2 * TL_RES_LEN;
		int[] tl_tab = new int[TL_TAB_LEN];

		private const int ENV_QUIET = TL_TAB_LEN >> 3;

		/* sin waveform table in 'decibel' scale */
		int[] sin_tab = new int[(1 << SIN_BITS)];

		/* translate from D1L to volume index (16 D1L levels) */
		private uint[] d1l_tab = new uint[16];

		private byte[] eg_inc = YM2151Data.eg_inc;


		private byte[] eg_rate_select = Ym2151RateSelect.Create(RATE_STEPS);
		private byte[] eg_rate_shift = Ym2151RateShift.Create();

		/*  DT2 defines offset in cents from base note
		*
		*   This table defines offset in frequency-deltas table.
		*   User's Manual page 22
		*
		*   Values below were calculated using formula: value =  orig.val / 1.5625
		*
		*   DT2=0 DT2=1 DT2=2 DT2=3
		*   0     600   781   950
		*/
		private uint[] dt2_tab = { 0, 384, 500, 608 };

		/*  DT1 defines offset in Hertz from base note
		*   This table is converted while initialization...
		*   Detune table shown in YM2151 User's Manual is wrong (verified on the real chip)
		*/

		private byte[] dt1_tab = new byte[4 * 32] { /* 4*32 DT1 values */
			/* DT1=0 */
			  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,

			/* DT1=1 */
			  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
			  2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 8, 8, 8, 8,

			/* DT1=2 */
			  1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5,
			  5, 6, 6, 7, 8, 8, 9,10,11,12,13,14,16,16,16,16,

			/* DT1=3 */
			  2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7,
			  8, 8, 9,10,11,12,13,14,16,17,19,20,22,22,22,22
			};

		private ushort[] phaseinc_rom = YM2151Data.PhaseInRom;
		private byte[] lfo_noise_waveform = YM2151Data.lfo_noise_waveform;







		public Ym2151()
		{
			oper = new YM2151Operator[32];
			for (int i = 0; i < 32; i++)
				oper[i] = new YM2151Operator();
		}



		public void YM_Create(uint clock)
		{
			YM_initalized = 0;
			YM_clock = clock;
		}

		private void YM_init_tables()
		{
			int i;
			int x;
			int n;
			double o;
			double m;

			for (x = 0; x < TL_RES_LEN; x++)
			{
				m = (1 << 16) / Math.Pow(2, (x + 1) * (ENV_STEP / 4.0) / 8.0);
				m = Math.Floor(m);

				/* we never reach (1<<16) here due to the (x+1) */
				/* result fits within 16 bits at maximum */

				n = (int)m; // 16 bits here
				n >>= 4; // 12 bits here
				if ((n & 1) != 0) // round to closest
				{
					n = (n >> 1) + 1;
				}
				else
				{
					n = n >> 1;
				}
				/* 11 bits here (rounded) */
				n <<= 2; // 13 bits here (as in real chip)
				tl_tab[x * 2 + 0] = n;
				tl_tab[x * 2 + 1] = -tl_tab[x * 2 + 0];

				for (i = 1; i < 13; i++)
				{
					tl_tab[x * 2 + 0 + i * 2 * TL_RES_LEN] = tl_tab[x * 2 + 0] >> i;
					tl_tab[x * 2 + 1 + i * 2 * TL_RES_LEN] = -tl_tab[x * 2 + 0 + i * 2 * TL_RES_LEN];
				}
				#if false
					//        logerror("tl %04i", x*2);
					//        for (i=0; i<13; i++)
					//            logerror(", [%02i] %4i", i*2, tl_tab[ x*2  + i*2*TL_RES_LEN ]);
					//        logerror("\n");
				#endif
			}
			/*logerror("TL_TAB_LEN = %i (%i bytes)\n",TL_TAB_LEN, (int)sizeof(tl_tab));*/
			/*logerror("ENV_QUIET= %i\n",ENV_QUIET );*/


			for (i = 0; i < SIN_LEN; i++)
			{
				/* non-standard sinus */
				m = Math.Sin(((i * 2) + 1) * PI / SIN_LEN); // verified on the real chip

				/* we never reach zero here due to ((i*2)+1) */

				if (m > 0.0)
				{
					o = 8 * Math.Log(1.0 / m) / Math.Log(2.0); // convert to 'decibels'
				}
				else
				{
					o = 8 * Math.Log(-1.0 / m) / Math.Log(2.0); // convert to 'decibels'
				}

				o = o / (ENV_STEP / 4);

				n = (int)(2.0 * o);
				if ((n & 1) != 0) // round to closest
				{
					n = (n >> 1) + 1;
				}
				else
				{
					n = n >> 1;
				}

				sin_tab[i] = n * 2 + (m >= 0.0 ? 0 : 1);
				/*logerror("sin [0x%4x]= %4i (tl_tab value=%8x)\n", i, sin_tab[i],tl_tab[sin_tab[i]]);*/
			}
			/* calculate d1l_tab table */
			for (i = 0; i < 16; i++)
			{
				m = (i != 15 ? i : i + 16) * (4.0 / ENV_STEP); // every 3 'dB' except for all bits = 1 = 45+48 'dB'
				d1l_tab[i] = (uint)m;
				/*logerror("d1l_tab[%02x]=%08x\n",i,d1l_tab[i] );*/
			}

		}


		private void YM_init_chip_tables()
		{
			int i;
			int j;
			double mult;
			double phaseinc;
			double Hz;
			double scaler;
			double pom;

			scaler = ((double)YM_clock / 64.0) / ((double)YM_sampfreq);
			/*logerror("scaler    = %20.15f\n", scaler);*/

			/* this loop calculates Hertz values for notes from c-0 to b-7 */
			/* including 64 'cents' (100/64 that is 1.5625 of real cent) per note */
			/* i*100/64/1200 is equal to i/768 */

			/* real chip works with 10 bits fixed point values (10.10) */
			mult = (1 << (FREQ_SH - 10)); // -10 because phaseinc_rom table values are already in 10.10 format

			for (i = 0; i < 768; i++)
			{
				/* 3.4375 Hz is note A; C# is 4 semitones higher */
				Hz = 1000;
#if false
// /* Hz is close, but not perfect */
//        //Hz = scaler * 3.4375 * pow (2, (i + 4 * 64 ) / 768.0 );
// /* calculate phase increment */
//        phaseinc = (Hz*SIN_LEN) / (double)sampfreq;
#endif

				phaseinc = phaseinc_rom[i]; // real chip phase increment
				phaseinc *= scaler; // adjust


				/* octave 2 - reference octave */
				freq[768 + 2 * 768 + i] = (uint)(((int)(phaseinc * mult)) & 0xffffffc0); // adjust to X.10 fixed point
				/* octave 0 and octave 1 */
				for (j = 0; j < 2; j++)
				{
					freq[768 + j * 768 + i] = (freq[768 + 2 * 768 + i] >> (2 - j)) & 0xffffffc0; // adjust to X.10 fixed point
				}
				/* octave 3 to 7 */
				for (j = 3; j < 8; j++)
				{
					freq[768 + j * 768 + i] = freq[768 + 2 * 768 + i] << (j - 2);
				}

#if false
//            pom = (double)freq[ 768+2*768+i ] / ((double)(1<<FREQ_SH));
//            pom = pom * (double)sampfreq / (double)SIN_LEN;
//            logerror("1freq[%4i][%08x]= real %20.15f Hz  emul %20.15f Hz\n", i, freq[ 768+2*768+i ], Hz, pom);
#endif
			}

			/* octave -1 (all equal to: oct 0, _KC_00_, _KF_00_) */
			for (i = 0; i < 768; i++)
			{
				freq[0 * 768 + i] = freq[1 * 768 + 0];
			}

			/* octave 8 and 9 (all equal to: oct 7, _KC_14_, _KF_63_) */
			for (j = 8; j < 10; j++)
			{
				for (i = 0; i < 768; i++)
				{
					freq[768 + j * 768 + i] = freq[768 + 8 * 768 - 1];
				}
			}

#if false
//        for (i=0; i<11*768; i++)
//        {
//            pom = (double)freq[i] / ((double)(1<<FREQ_SH));
//            pom = pom * (double)sampfreq / (double)SIN_LEN;
//            logerror("freq[%4i][%08x]= emul %20.15f Hz\n", i, freq[i], pom);
//        }
#endif

			mult = (1 << FREQ_SH);
			for (j = 0; j < 4; j++)
			{
				for (i = 0; i < 32; i++)
				{
					Hz = ((double)dt1_tab[j * 32 + i] * ((double)YM_clock / 64.0)) / (double)(1 << 20);

					/*calculate phase increment*/
					phaseinc = (Hz * SIN_LEN) / (double)YM_sampfreq;

					/*positive and negative values*/
					dt1_freq[(j + 0) * 32 + i] = (int)(phaseinc * mult);
					dt1_freq[(j + 4) * 32 + i] = -dt1_freq[(j + 0) * 32 + i];

#if false
//            {
//                int x = j*32 + i;
//                pom = (double)dt1_freq[x] / mult;
//                pom = pom * (double)sampfreq / (double)SIN_LEN;
//                logerror("DT1(%03i)[%02i %02i][%08x]= real %19.15f Hz  emul %19.15f Hz\n",
//                         x, j, i, dt1_freq[x], Hz, pom);
//            }
#endif
				}
			}


			/* calculate timers' deltas */
			/* User's Manual pages 15,16  */
			mult = (1 << TIMER_SH);
			for (i = 0; i < 1024; i++)
			{
				/* ASG 980324: changed to compute both tim_A_tab and timer_A_time */
				//pom= attotime::from_hz(clock) * (64 * (1024 - i));
				pom = (64.0 * (1024.0 - i) / (double)YM_clock);
#if USE_MAME_TIMERS
			timer_A_time[i] = pom;
#else
				//tim_A_tab[i] = pom.as_double() * (double)sampfreq * mult;  /* number of samples that timer period takes (fixed point) */
				tim_A_tab[i] = (int)(pom * (double)YM_sampfreq * mult);
#endif
			}
			for (i = 0; i < 256; i++)
			{
				/* ASG 980324: changed to compute both tim_B_tab and timer_B_time */
				//pom= attotime::from_hz(clock) * (1024 * (256 - i));
				pom = (1024.0 * (256.0 - i) / (double)YM_clock);
#if USE_MAME_TIMERS
			timer_B_time[i] = pom;
#else
				//tim_B_tab[i] = pom.as_double() * (double)sampfreq * mult;  /* number of samples that timer period takes (fixed point) */
				tim_B_tab[i] = (int)(pom * (double)YM_sampfreq * mult);
#endif
			}

			/* calculate noise periods table */
			scaler = ((double)YM_clock / 64.0) / ((double)YM_sampfreq);
			for (i = 0; i < 32; i++)
			{
				j = (i != 31 ? i : 30); // rate 30 and 31 are the same
				j = 32 - j;
				j = (int)(65536.0 / (double)(j * 32.0)); // number of samples per one shift of the shift register
				/*noise_tab[i] = j * 64;*/
				/* number of chip clock cycles per one shift */
				noise_tab[i] = (uint)(j * 64 * scaler);
				/*logerror("noise_tab[%02x]=%08x\n", i, noise_tab[i]);*/
			}
		}

		private void KEY_ON(YM2151Operator op,byte key_set) {
			if (op.key == 0)
			{
				op.phase = 0;            /* clear phase */
				op.state = EG_ATT;        /* KEY ON = attack */
				op.volume += (~op.volume *
							   (eg_inc[op.eg_sel_ar + ((eg_cnt >> op.eg_sh_ar) & 7)])
							  ) >> 4;
				if (op.volume <= MIN_ATT_INDEX)
				{
					op.volume = MIN_ATT_INDEX;
					op.state = EG_DEC;
				}
			}
		op.key |= key_set;
		}

		private void KEY_OFF(YM2151Operator op, byte key_clr) {
			if (op.key > 0)
			{
				op.key &= key_clr;
				if (op.key == 0)
				{
					if (op.state > EG_REL)
						op.state = EG_REL;/* KEY OFF = release */
				}
			}
		}

		private void YM_envelope_KONKOFF(int opIndex, int v)
		{
			if ((v & 0x08) > 0)    /* M1 */
				KEY_ON(oper[opIndex], 1);
			else
				KEY_OFF(oper[opIndex], unchecked((byte)~1));

			if ((v & 0x20) > 0)    /* M2 */
				KEY_ON(oper[opIndex + 1], 1);
			else
				KEY_OFF(oper[opIndex + 2], unchecked((byte)~1));
			if ((v & 0x10) > 0)    /* C1 */
				KEY_ON(oper[opIndex + 2], 1);
			else
				KEY_OFF(oper[opIndex + 2], unchecked((byte)~1));


			if ((v & 0x40) > 0)    /* C2 */
				KEY_ON(oper[opIndex + 3], 1);
			else
				KEY_OFF(oper[opIndex + 3], unchecked((byte) ~1));
		}

		private void YM_set_connect(int opIndex, int cha, int v)
		{

			YM2151Operator om1 = oper[opIndex];
			YM2151Operator om2 = oper[opIndex + 1];
			YM2151Operator oc1 = oper[opIndex + 2];

			/* set connect algorithm */

			/* MEM is simply one sample delay */

			switch (v & 7)
			{
				case 0:
					/* M1---C1---MEM---M2---C2---OUT */
					om1.connects = c1;
					oc1.connects = mem;
					om2.connects = c2;
					om1.mem_connect = m2;
					break;

				case 1:
					/* M1------+-MEM---M2---C2---OUT */
					/*      C1-+                     */
					om1.connects = mem;
					oc1.connects = mem;
					om2.connects = c2;
					om1.mem_connect = m2;
					break;

				case 2:
					/* M1-----------------+-C2---OUT */
					/*      C1---MEM---M2-+          */
					om1.connects = c2;
					oc1.connects = mem;
					om2.connects = c2;
					om1.mem_connect = m2;
					break;

				case 3:
					/* M1---C1---MEM------+-C2---OUT */
					/*                 M2-+          */
					om1.connects = c1;
					oc1.connects = mem;
					om2.connects = c2;
					om1.mem_connect = c2;
					break;

				case 4:
					/* M1---C1-+-OUT */
					/* M2---C2-+     */
					/* MEM: not used */
					om1.connects = c1;
					oc1.connects = chanout[cha];
					om2.connects = c2;
					om1.mem_connect = mem; // store it anywhere where it will not be used
					break;

				case 5:
					/*    +----C1----+     */
					/* M1-+-MEM---M2-+-OUT */
					/*    +----C2----+     */
					om1.connects = 0; // special mark
					oc1.connects = chanout[cha];
					om2.connects = chanout[cha];
					om1.mem_connect= m2;
					break;

				case 6:
					/* M1---C1-+     */
					/*      M2-+-OUT */
					/*      C2-+     */
					/* MEM: not used */
					om1.connects = c1;
					oc1.connects = chanout[cha];
					om2.connects = chanout[cha];
					om1.mem_connect= mem; // store it anywhere where it will not be used
					break;

				case 7:
					/* M1-+     */
					/* C1-+-OUT */
					/* M2-+     */
					/* C2-+     */
					/* MEM: not used*/
					om1.connects = chanout[cha];
					oc1.connects = chanout[cha];
					om2.connects = chanout[cha];
					om1.mem_connect = mem; // store it anywhere where it will not be used
					break;
			}
		}


		private void YM_refresh_EG(int opIndex)
		{
			uint kc;
			uint v;
			var op = oper[opIndex];
			kc = op.kc;

			/* v = 32 + 2*RATE + RKS = max 126 */

			v = kc >> (int)op.ks;
			if ((op.ar + v) < 32 + 62)
			{
				op.eg_sh_ar = eg_rate_shift[op.ar + v];
				op.eg_sel_ar = eg_rate_select[op.ar + v];
			}
			else
			{
				op.eg_sh_ar = 0;
				op.eg_sel_ar = 17 * RATE_STEPS;
			}
			op.eg_sh_d1r = eg_rate_shift[op.d1r + v];
			op.eg_sel_d1r = eg_rate_select[op.d1r + v];
			op.eg_sh_d2r = eg_rate_shift[op.d2r + v];
			op.eg_sel_d2r = eg_rate_select[op.d2r + v];
			op.eg_sh_rr = eg_rate_shift[op.rr + v];
			op.eg_sel_rr = eg_rate_select[op.rr + v];


			op = oper[opIndex + 1];

			v = kc >> (int)op.ks;
			if ((op.ar + v) < 32 + 62)
			{
				op.eg_sh_ar = eg_rate_shift[op.ar + v];
				op.eg_sel_ar = eg_rate_select[op.ar + v];
			}
			else
			{
				op.eg_sh_ar = 0;
				op.eg_sel_ar = 17 * RATE_STEPS;
			}
			op.eg_sh_d1r = eg_rate_shift[op.d1r + v];
			op.eg_sel_d1r = eg_rate_select[op.d1r + v];
			op.eg_sh_d2r = eg_rate_shift[op.d2r + v];
			op.eg_sel_d2r = eg_rate_select[op.d2r + v];
			op.eg_sh_rr = eg_rate_shift[op.rr + v];
			op.eg_sel_rr = eg_rate_select[op.rr + v];

			op = oper[opIndex + 2];

			v = (kc >> (int)op.ks);
			if ((op.ar + v) < 32 + 62)
			{
				op.eg_sh_ar = eg_rate_shift[op.ar + v];
				op.eg_sel_ar = eg_rate_select[op.ar + v];
			}
			else
			{
				op.eg_sh_ar = 0;
				op.eg_sel_ar = 17 * RATE_STEPS;
			}
			op.eg_sh_d1r = eg_rate_shift[op.d1r + v];
			op.eg_sel_d1r = eg_rate_select[op.d1r + v];
			op.eg_sh_d2r = eg_rate_shift[op.d2r + v];
			op.eg_sel_d2r = eg_rate_select[op.d2r + v];
			op.eg_sh_rr = eg_rate_shift[op.rr + v];
			op.eg_sel_rr = eg_rate_select[op.rr + v];

			op = oper[opIndex + 3];

			v = (kc >> (int)op.ks);
			if ((op.ar + v) < 32 + 62)
			{
				op.eg_sh_ar = eg_rate_shift[op.ar + v];
				op.eg_sel_ar = eg_rate_select[op.ar + v];
			}
			else
			{
				op.eg_sh_ar = 0;
				op.eg_sel_ar = 17 * RATE_STEPS;
			}
			op.eg_sh_d1r = eg_rate_shift[op.d1r + v];
			op.eg_sel_d1r = eg_rate_select[op.d1r + v];
			op.eg_sh_d2r = eg_rate_shift[op.d2r + v];
			op.eg_sel_d2r = eg_rate_select[op.d2r + v];
			op.eg_sh_rr = eg_rate_shift[op.rr + v];
			op.eg_sel_rr = eg_rate_select[op.rr + v];
		}


		/* write a register on YM2151 chip number 'n' */
		public void YM_write_reg(int r, int v)
		{
			var opIndex = (r & 0x07) * 4 + ((r & 0x18) >> 3);
			YM2151Operator op = oper[opIndex];
			
			/* adjust bus to 8 bits */
			r &= 0xff;
			v &= 0xff;

#if false
// /* There is no info on what YM2151 really does when busy flag is set */
//    if ( status & 0x80 ) return;
//    timer_set ( attotime::from_hz(clock) * 64, chip, 0, timer_callback_chip_busy);
//    status |= 0x80;    // set busy flag for 64 chip clock cycles 
#endif

			switch (r & 0xe0)
			{
				case 0x00:
					switch (r)
					{
						case 0x01: // LFO reset(bit 1), Test Register (other bits)
							test = (byte)v;
							if ((v & 2) != 0)
							{
								lfo_phase = 0;
							}
							break;

						case 0x08:
							int idxx = (v & 7) * 4;
							YM_envelope_KONKOFF((v & 7) * 4, v);
							break;

						case 0x0f: // noise mode enable, noise period
							noise = (uint)v;
							noise_f = noise_tab[v & 0x1f];
							break;

						case 0x10: // timer A hi
							timer_A_index = (uint)((timer_A_index & 0x003) | (v << 2));
							break;

						case 0x11: // timer A low
							timer_A_index = (uint)((timer_A_index & 0x3fc) | (v & 3));
							break;

						case 0x12: // timer B
							timer_B_index = (uint)v;
							break;
						case 0x14: // CSM, irq flag reset, irq enable, timer start/stop

							irq_enable = (uint)v; // bit 3-timer B, bit 2-timer A, bit 7 - CSM

							if ((v & 0x10) != 0) // reset timer A irq flag
							{
#if USE_MAME_TIMERS
				status &= ~1;
				device.machine().scheduler().timer_set(attotime.zero, FUNC(irqAoff_callback), 0, chip);
#else
								//////////////int oldstate = status & 3;
								status &= unchecked((uint)~1);
								////////////if ((oldstate==1) && (irqhandler)) (*irqhandler)(device, 0);
#endif
							}

							if ((v & 0x20) != 0) // reset timer B irq flag
							{
#if USE_MAME_TIMERS
				status &= ~2;
				device.machine().scheduler().timer_set(attotime.zero, FUNC(irqBoff_callback), 0, chip);
#else
								/////////int oldstate = status & 3;
								status &= unchecked((uint)~2);
								/////////if ((oldstate==2) && (irqhandler)) (*irqhandler)(device, 0);
#endif
							}

							if ((v & 0x02) != 0)
							{ // load and start timer B
#if USE_MAME_TIMERS
				/* ASG 980324: added a real timer */
				/* start timer _only_ if it wasn't already started (it will reload time value next round) */
					if (!timer_B.enable(1))
					{
						timer_B.adjust(timer_B_time[timer_B_index]);
						timer_B_index_old = timer_B_index;
					}
#else
								if (tim_B ==0)
								{
									tim_B = 1;
									tim_B_val = tim_B_tab[timer_B_index];
								}
#endif
							}
							else
							{ // stop timer B
#if USE_MAME_TIMERS
				/* ASG 980324: added a real timer */
					timer_B.enable(0);
#else
								tim_B = 0;
#endif
							}

							if ((v & 0x01) != 0)
							{ // load and start timer A
#if USE_MAME_TIMERS
				/* ASG 980324: added a real timer */
				/* start timer _only_ if it wasn't already started (it will reload time value next round) */
					if (!timer_A.enable(1))
					{
						timer_A.adjust(timer_A_time[timer_A_index]);
						timer_A_index_old = timer_A_index;
					}
#else
								if (tim_A == 0)
								{
									tim_A = 1;
									tim_A_val = tim_A_tab[timer_A_index];
								}
#endif
							}
							else
							{ // stop timer A
#if USE_MAME_TIMERS
				/* ASG 980324: added a real timer */
					timer_A.enable(0);
#else
								tim_A = 0;
#endif
							}
							break;

						case 0x18: // LFO frequency
							{
								lfo_overflow = (uint)( (1 << ((15 - (v >> 4)) + 3)) * (1 << LFO_SH));
								lfo_counter_add = (uint)(0x10 + (v & 0x0f));
							}
							break;

						case 0x19: // PMD (bit 7==1) or AMD (bit 7==0)
							if ((v & 0x80) != 0)
							{
								pmd = (char)(v & 0x7f);
							}
							else
							{
								amd = (byte)(v & 0x7f);
							}
							break;

						case 0x1b: // CT2, CT1, LFO waveform
							ct = (byte)(v >> 6);
							lfo_wsel = (byte)(v & 3);
							//if (porthandler) (*porthandler)(device, 0 , ct );
							break;

						default:
							//logerror("YM2151 Write %02x to undocumented register #%02x\n",v,r);
							break;
					}
					break;
				case 0x20:
					opIndex = (r & 7) * 4;
					op = oper[opIndex];
					switch (r & 0x18)
					{
						case 0x00: // RL enable, Feedback, Connection
							op.fb_shift = (uint)(((v >> 3) & 7) != 0 ? ((v >> 3) & 7) + 6 : 0);
							pan[(r & 7) * 2] = (uint)((v & 0x40) != 0 ? ~0 : 0);
							pan[(r & 7) * 2 + 1] = (uint)((v & 0x80) != 0 ? ~0 : 0);
							connects[r & 7] = (byte)( v & 7);
							YM_set_connect(opIndex, r & 7, v & 7);
							break;

						case 0x08: // Key Code
							v &= 0x7f;
							if (v != op.kc)
							{
								uint kc;
								uint kc_channel;

								kc_channel = (uint)((v - (v >> 2)) * 64);
								kc_channel += 768;
								kc_channel |= (op.kc_i & 63);

								oper[opIndex + 0].kc = (uint)v;
								oper[opIndex + 0].kc_i = kc_channel;
								oper[opIndex + 1].kc = (uint)v;
								oper[opIndex + 1].kc_i = kc_channel;
								oper[opIndex + 2].kc = (uint)v;
								oper[opIndex + 2].kc_i = kc_channel;
								oper[opIndex + 3].kc = (uint)v;
								oper[opIndex + 3].kc_i = kc_channel;

								kc = (uint)(v >> 2);

								oper[opIndex + 0].dt1 = dt1_freq[oper[opIndex + 0].dt1_i + kc];
								oper[opIndex + 0].freq = (uint)(((freq[kc_channel + oper[opIndex + 0].dt2] + oper[opIndex + 0].dt1) * oper[opIndex + 0].mul) >> 1);

								oper[opIndex + 1].dt1 = dt1_freq[oper[opIndex + 1].dt1_i + kc];
								oper[opIndex + 1].freq = (uint)(((freq[kc_channel + oper[opIndex + 1].dt2] + oper[opIndex + 1].dt1) * oper[opIndex + 1].mul) >> 1);

								oper[opIndex + 2].dt1 = dt1_freq[oper[opIndex + 2].dt1_i + kc];
								oper[opIndex + 2].freq = (uint)(((freq[kc_channel + oper[opIndex + 2].dt2] + oper[opIndex + 2].dt1) * oper[opIndex + 2].mul) >> 1);

								oper[opIndex + 3].dt1 = dt1_freq[oper[opIndex + 3].dt1_i + kc];
								oper[opIndex + 3].freq = (uint)(((freq[kc_channel + oper[opIndex + 3].dt2] + oper[opIndex + 3].dt1) * oper[opIndex + 3].mul) >> 1);

								YM_refresh_EG(opIndex);
							}
							break;

						case 0x10: // Key Fraction
							v >>= 2;
							if (v != (op.kc_i & 63))
							{
								uint kc_channel;

								kc_channel = (uint)v;
								kc_channel |= (uint)(op.kc_i & ~63);

								oper[opIndex + 0].kc_i = kc_channel;
								oper[opIndex + 1].kc_i = kc_channel;
								oper[opIndex + 2].kc_i = kc_channel;
								oper[opIndex + 3].kc_i = kc_channel;

								oper[opIndex + 0].freq = (uint)(((freq[kc_channel + oper[opIndex + 0].dt2] + oper[opIndex + 0].dt1) * oper[opIndex + 0].mul) >> 1);
								oper[opIndex + 1].freq = (uint)(((freq[kc_channel + oper[opIndex + 1].dt2] + oper[opIndex + 1].dt1) * oper[opIndex + 1].mul) >> 1);
								oper[opIndex + 2].freq = (uint)(((freq[kc_channel + oper[opIndex + 2].dt2] + oper[opIndex + 2].dt1) * oper[opIndex + 2].mul) >> 1);
								oper[opIndex + 3].freq = (uint)(((freq[kc_channel + oper[opIndex + 3].dt2] + oper[opIndex + 3].dt1) * oper[opIndex + 3].mul) >> 1);
							}
							break;

						case 0x18: // PMS, AMS
							op.pms = (uint)((v >> 4) & 7);
							op.ams = (uint)(v & 3);
							break;
					}
					break;
				case 0x40: // DT1, MUL
					{
						uint olddt1_i = op.dt1_i;
						uint oldmul = op.mul;

						op.dt1_i = (uint)((v & 0x70) << 1);
						op.mul = (uint)((v & 0x0f) != 0 ? (v & 0x0f) << 1 : 1);

						if (olddt1_i != op.dt1_i)
						{
							op.dt1 = dt1_freq[op.dt1_i + (op.kc >> 2)];
						}

						if ((olddt1_i != op.dt1_i) || (oldmul != op.mul))
						{
							op.freq = (uint)(((freq[op.kc_i + op.dt2] + op.dt1) * op.mul) >> 1);
						}
					}
					break;

				case 0x60: // TL
					op.tl = (uint)((v & 0x7f) << (ENV_BITS - 7)); // 7bit TL
					break;

				case 0x80: // KS, AR
					{
						uint oldks = op.ks;
						uint oldar = op.ar;

						op.ks = (uint)(5 - (v >> 6));
						op.ar = (uint)((v & 0x1f) != 0 ? 32 + ((v & 0x1f) << 1) : 0);

						if ((op.ar != oldar) || (op.ks != oldks))
						{
							if ((op.ar + (op.kc >> (int)op.ks)) < 32 + 62)
							{
								op.eg_sh_ar = eg_rate_shift[op.ar + (op.kc >> (int)op.ks)];
								op.eg_sel_ar = eg_rate_select[op.ar + (op.kc >> (int)op.ks)];
							}
							else
							{
								op.eg_sh_ar = 0;
								op.eg_sel_ar = 17 * RATE_STEPS;
							}
						}

						if (op.ks != oldks)
						{
							op.eg_sh_d1r = eg_rate_shift[op.d1r + (op.kc >> (int)op.ks)];
							op.eg_sel_d1r = eg_rate_select[op.d1r + (op.kc >> (int)op.ks)];
							op.eg_sh_d2r = eg_rate_shift[op.d2r + (op.kc >> (int)op.ks)];
							op.eg_sel_d2r = eg_rate_select[op.d2r + (op.kc >> (int)op.ks)];
							op.eg_sh_rr = eg_rate_shift[op.rr + (op.kc >> (int)op.ks)];
							op.eg_sel_rr = eg_rate_select[op.rr + (op.kc >> (int)op.ks)];
						}
					}
					break;

				case 0xa0: // LFO AM enable, D1R
					op.AMmask = (uint)((v & 0x80) != 0 ? ~0 : 0);
					op.d1r = (uint)((v & 0x1f) != 0 ? 32 + ((v & 0x1f) << 1) : 0);
					op.eg_sh_d1r = eg_rate_shift[op.d1r + (op.kc >> (int)op.ks)];
					op.eg_sel_d1r = eg_rate_select[op.d1r + (op.kc >> (int)op.ks)];
					break;

				case 0xc0: // DT2, D2R
					{
						uint olddt2 = op.dt2;
						op.dt2 = dt2_tab[v >> 6];
						if (op.dt2 != olddt2)
						{
							op.freq = (uint)(((freq[op.kc_i + op.dt2] + op.dt1) * op.mul) >> 1);
						}
					}
					op.d2r = (uint)((v & 0x1f) != 0 ? 32 + ((v & 0x1f) << 1) : 0);
					op.eg_sh_d2r = eg_rate_shift[op.d2r + (op.kc >> (int)op.ks)];
					op.eg_sel_d2r = eg_rate_select[op.d2r + (op.kc >> (int)op.ks)];
					break;

				case 0xe0: // D1L, RR
					op.d1l = d1l_tab[v >> 4];
					op.rr = (uint)(34 + ((v & 0x0f) << 2));
					op.eg_sh_rr = eg_rate_shift[op.rr + (op.kc >> (int)op.ks)];
					op.eg_sel_rr = eg_rate_select[op.rr + (op.kc >> (int)op.ks)];
					break;
			}
		}



		public uint YM_read_status()
		{
			return status;
		}

		/*
		*   Initialize YM2151 emulator(s).
		*
		*   'num' is the number of virtual YM2151's to allocate
		*   'clock' is the chip clock in Hz
		*   'rate' is sampling rate
		*/
		public void YM_init(int rate, int fps)
		{
			YM_fps = (uint)fps;
			YM_sample_freq = (uint)rate;
			YM_channels = (byte)YM_STEREO;

			YM_initalized = 1;

			YM_sampfreq = rate;
			YM_init_tables();

			YM_sampfreq = rate != 0 ? rate : 44100; // avoid division by 0 in init_chip_tables()

			YM_init_chip_tables();

			lfo_timer_add = (uint)((1 << LFO_SH) * (YM_clock / 64.0) / YM_sampfreq);

			eg_timer_add = (uint)((1 << EG_SH) * (YM_clock / 64.0) / YM_sampfreq);
			eg_timer_overflow = (3) * (1 << EG_SH);

			/*logerror("YM2151[init] eg_timer_add=%8x eg_timer_overflow=%8x\n", PSG->eg_timer_add, PSG->eg_timer_overflow);*/

#if USE_MAME_TIMERS
/* this must be done _before_ a call to ym2151_reset_chip() */
	PSG.timer_A = device.machine().scheduler().timer_alloc(FUNC(timer_callback_a), PSG);
	PSG.timer_B = device.machine().scheduler().timer_alloc(FUNC(timer_callback_b), PSG);
#else
			tim_A = 0;
			tim_B = 0;
#endif
			YM_ym2151_reset_chip();
			/*logerror("YM2151[init] clock=%i sampfreq=%i\n", PSG->clock, PSG->sampfreq);*/
		}

		private void ym2151_shutdown()
		{

		}


		/*
*   Reset chip number 'n'.
*/
		private void YM_ym2151_reset_chip()
		{
			int i;
			/* initialize hardware registers */
			for (i = 0; i < 32; i++)
			{
				oper[i] = new YM2151Operator();
				//memset(oper[i], '\0', sizeof(YM2151Operator));
				oper[i].volume = MAX_ATT_INDEX;
				oper[i].kc_i = 768; // min kc_i value
			}

			chanout[0] = 0;
			chanout[1] = 0;
			chanout[2] = 0;
			chanout[3] = 0;
			chanout[4] = 0;
			chanout[5] = 0;
			chanout[6] = 0;
			chanout[7] = 0;

			eg_timer = 0;
			eg_cnt = 0;

			lfo_timer = 0;
			lfo_counter = 0;
			lfo_phase = 0;
			lfo_wsel = 0;
			pmd = (char)0;
			amd = 0;
			lfa = 0;
			lfp = 0;

			test = 0;

			irq_enable = 0;
#if USE_MAME_TIMERS
	/* ASG 980324 -- reset the timers before writing to the registers */
	timer_A.enable(0);
	timer_B.enable(0);
#else
			tim_A = 0;
			tim_B = 0;
			tim_A_val = 0;
			tim_B_val = 0;
#endif
			timer_A_index = 0;
			timer_B_index = 0;
			timer_A_index_old = 0;
			timer_B_index_old = 0;

			noise = 0;
			noise_rng = 0;
			noise_p = 0;
			noise_f = noise_tab[0];

			csm_req = 0;
			status = 0;

			YM_write_reg(0x1b, 0); // only because of CT1, CT2 output pins
			YM_write_reg(0x18, 0); // set LFO frequency
			for (i = 0x20; i < 0x100; i++) // set the operators
			{
				YM_write_reg(i, 0);
			}
		}

		private int YM_op_calc(YM2151Operator OP, uint env, int pm)
		{
			uint p;
			p = (uint)((env << 3) + sin_tab[(((int)((OP.phase & ~FREQ_MASK) + (pm << 15))) >> FREQ_SH) & SIN_MASK]);

			if (p >= TL_TAB_LEN)
			{
				return 0;
			}

			return tl_tab[p];
		}

		private int YM_op_calc1(YM2151Operator OP, uint env, int pm)
		{
			uint p;
			int i;
			i = (int)((OP.phase & ~FREQ_MASK) + pm);

			/*logerror("i=%08x (i>>16)&511=%8i phase=%i [pm=%08x] ",i, (i>>16)&511, OP->phase>>FREQ_SH, pm);*/

			p = (uint)((env << 3) + sin_tab[(i >> FREQ_SH) & SIN_MASK]);

			/*logerror("(p&255=%i p>>8=%i) out= %i\n", p&255,p>>8, tl_tab[p&255]>>(p>>8) );*/

			if (p >= TL_TAB_LEN)
			{
				return 0;
			}

			return tl_tab[p];
		}

		private uint volume_calc(YM2151Operator OP, uint AM) => (uint)(OP.tl + (OP.volume + (AM & (OP.AMmask))));


		private void YM_chan_calc(uint chan)
		{
			YM2151Operator op;
			uint env;
			uint AM = 0;

			m2 = c1 = c2 = mem = 0;
			var opIndex = chan * 4;
			op = oper[opIndex]; // M1

			op.mem_connect = op.mem_value; // restore delayed sample (MEM) value to m2 or c2

			if (op.ams >0)
			{
				AM = (lfa << (int)(op.ams - 1));
			}
			env = volume_calc(op, AM);
			{
				int @out = op.fb_out_prev + op.fb_out_curr;
				op.fb_out_prev = op.fb_out_curr;

				if (op.connects == 0)
				{
					/* algorithm 5 */
					mem = c1 = c2 = op.fb_out_prev;
				}
				else
				{
					/* other algorithms */
					op.connects = op.fb_out_prev;
				}

				op.fb_out_curr = 0;
				if (env < ENV_QUIET)
				{
					if (op.fb_shift == 0)
					{
						@out = 0;
					}
					op.fb_out_curr = YM_op_calc1(op, env, (@out << (int)op.fb_shift));
				}
			}

			env = volume_calc(oper[opIndex + 1], AM); // M2
			if (env < ENV_QUIET)
			{
				oper[opIndex + 1].connects += YM_op_calc(oper[opIndex + 1], env, m2);
			}

			env = volume_calc(oper[opIndex + 2], AM); // C1
			if (env < ENV_QUIET)
			{
				oper[opIndex + 2].connects += YM_op_calc(oper[opIndex + 2], env, c1);
			}

			env = volume_calc(oper[opIndex + 3], AM); // C2
			if (env < ENV_QUIET)
			{
				chanout[chan] += YM_op_calc(oper[opIndex + 3], env, c2);
			}

			/* M1 */
			op.mem_value = mem;
		}

		private void YM_chan7_calc()
		{
			YM2151Operator op;
			uint env;
			uint AM = 0;

			m2 = c1 = c2 = mem = 0;
			var opIndex = 7 * 4;
			op = oper[opIndex]; // M1

			op.mem_connect = op.mem_value; // restore delayed sample (MEM) value to m2 or c2

			if (op.ams >0)
			{
				AM = (uint)(lfa << (int)(op.ams - 1));
			}
			env = volume_calc(op, AM);
			{
				int @out = op.fb_out_prev + op.fb_out_curr;
				op.fb_out_prev = op.fb_out_curr;

				if (op.connects == 0)
				{
					/* algorithm 5 */
					mem = c1 = c2 = op.fb_out_prev;
				}
				else
				{
					/* other algorithms */
					op.connects = op.fb_out_prev;
				}

				op.fb_out_curr = 0;
				if (env < ENV_QUIET)
				{
					if (op.fb_shift == 0)
					{
						@out = 0;
					}
					op.fb_out_curr = YM_op_calc1(op, env, (@out << (int)op.fb_shift));
				}
			}

			env = volume_calc(oper[opIndex + 1], AM); // M2
			if (env < ENV_QUIET)
			{
				oper[opIndex + 1].connects += YM_op_calc(oper[opIndex + 1], env, m2);
			}

			env = volume_calc(oper[opIndex + 2], AM); // C1
			if (env < ENV_QUIET)
			{
				oper[opIndex + 2].connects += YM_op_calc(oper[opIndex + 2], env, c1);
			}

			env = volume_calc(oper[opIndex + 3], AM); // C2
			if ((noise & 0x80) != 0)
			{
				int noiseout;

				noiseout = 0;
				if (env < 0x3ff)
				{
					noiseout = (int)((env ^ 0x3ff) * 2); // range of the YM2151 noise output is -2044 to 2040
				}
				chanout[7] += ((noise_rng & 0x10000) != 0 ? noiseout : -noiseout); // bit 16 -> output
			}
			else
			{
				if (env < ENV_QUIET)
				{
					//chanout[7] += YM_op_calc(op + 3, env, c2);
				}
			}
			/* M1 */
			op.mem_value = mem;
		}



		/*
		The 'rate' is calculated from following formula (example on decay rate):
		  rks = notecode after key scaling (a value from 0 to 31)
		  DR = value written to the chip register
		  rate = 2*DR + rks; (max rate = 2*31+31 = 93)
		Four MSBs of the 'rate' above are the 'main' rate (from 00 to 15)
		Two LSBs of the 'rate' above are the value 'x' (the shape type).
		(eg. '11 2' means that 'rate' is 11*4+2=46)

		NOTE: A 'sample' in the description below is actually 3 output samples,
		thats because the Envelope Generator clock is equal to internal_clock/3.

		Single '-' (minus) character in the diagrams below represents one sample
		on the output; this is for rates 11 x (11 0, 11 1, 11 2 and 11 3)

		these 'main' rates:
		00 x: single '-' = 2048 samples; (ie. level can change every 2048 samples)
		01 x: single '-' = 1024 samples;
		02 x: single '-' = 512 samples;
		03 x: single '-' = 256 samples;
		04 x: single '-' = 128 samples;
		05 x: single '-' = 64 samples;
		06 x: single '-' = 32 samples;
		07 x: single '-' = 16 samples;
		08 x: single '-' = 8 samples;
		09 x: single '-' = 4 samples;
		10 x: single '-' = 2 samples;
		11 x: single '-' = 1 sample; (ie. level can change every 1 sample)

		Shapes for rates 11 x look like this:
		rate:       step:
		11 0        01234567

		level:
		0           --
		1             --
		2               --
		3                 --

		rate:       step:
		11 1        01234567

		level:
		0           --
		1             --
		2               -
		3                -
		4                 --

		rate:       step:
		11 2        01234567

		level:
		0           --
		1             -
		2              -
		3               --
		4                 -
		5                  -

		rate:       step:
		11 3        01234567

		level:
		0           --
		1             -
		2              -
		3               -
		4                -
		5                 -
		6                  -


		For rates 12 x, 13 x, 14 x and 15 x output level changes on every
		sample - this means that the waveform looks like this: (but the level
		changes by different values on different steps)
		12 3        01234567

		0           -
		2            -
		4             -
		8              -
		10              -
		12               -
		14                -
		18                 -
		20                  -

		Notes about the timing:
		----------------------

		1. Synchronism

		Output level of each two (or more) voices running at the same 'main' rate
		(eg 11 0 and 11 1 in the diagram below) will always be changing in sync,
		even if there're started with some delay.

		Note that, in the diagram below, the decay phase in channel 0 starts at
		sample #2, while in channel 1 it starts at sample #6. Anyway, both channels
		will always change their levels at exactly the same (following) samples.

		(S - start point of this channel, A-attack phase, D-decay phase):

		step:
		01234567012345670123456

		channel 0:
		  --
		 |  --
		 |    -
		 |     -
		 |      --
		 |        --
		|           --
		|             -
		|              -
		|               --
		AADDDDDDDDDDDDDDDD
		S

		01234567012345670123456
		channel 1:
			  -
			 | -
			 |  --
			 |    --
			 |      --
			 |        -
			|          -
			|           --
			|             --
			|               --
			AADDDDDDDDDDDDDDDD
			S
		01234567012345670123456


		2. Shifted (delayed) synchronism

		Output of each two (or more) voices running at different 'main' rate
		(9 1, 10 1 and 11 1 in the diagrams below) will always be changing
		in 'delayed-sync' (even if there're started with some delay as in "1.")

		Note that the shapes are delayed by exactly one sample per one 'main' rate
		increment. (Normally one would expect them to start at the same samples.)

		See diagram below (* - start point of the shape).

		cycle:
		0123456701234567012345670123456701234567012345670123456701234567

		rate 09 1
		*-------
				--------
						----
							----
								--------
										*-------
										|       --------
										|               ----
										|                   ----
										|                       --------
		rate 10 1                       |
		--                              |
		  *---                          |
			  ----                      |
				  --                    |
					--                  |
					  ----              |
						  *---          |
						  |   ----      |
						  |       --    | | <- one step (two samples) delay between 9 1 and 10 1
						  |         --  | |
						  |           ----|
						  |               *---
						  |                   ----
						  |                       --
						  |                         --
						  |                           ----
		rate 11 1         |
		-                 |
		 --               |
		   *-             |
			 --           |
			   -          |
				-         |
				 --       |
				   *-     |
					 --   |
					   -  || <- one step (one sample) delay between 10 1 and 11 1
						- ||
						 --|
						   *-
							 --
							   -
								-
								 --
								   *-
									 --
									   -
										-
										 --
		*/


		private void YM_advance_eg()
		{
			var op = new YM2151Operator();
			uint i;

			eg_timer += eg_timer_add;

			while (eg_timer >= eg_timer_overflow)
			{
				eg_timer -= eg_timer_overflow;

				eg_cnt++;

				/* envelope generator */
				op = oper[0]; // CH 0 M1
				var opIndex = 0;
				i = 32;
				do
				{
					op = oper[opIndex];
					switch (op.state)
					{
						case EG_ATT: // attack phase
							if ((eg_cnt & ((1 << op.eg_sh_ar) - 1)) == 0)
							{
								op.volume += (~op.volume * (eg_inc[op.eg_sel_ar + ((eg_cnt >> op.eg_sh_ar) & 7)])) >> 4;

								if (op.volume <= MIN_ATT_INDEX)
								{
									op.volume = MIN_ATT_INDEX;
									op.state = EG_DEC;
								}

							}
							break;

						case EG_DEC: // decay phase
							if ((eg_cnt & ((1 << op.eg_sh_d1r) - 1)) == 0)
							{
								op.volume += eg_inc[op.eg_sel_d1r + ((eg_cnt >> op.eg_sh_d1r) & 7)];

								if (op.volume >= (int)op.d1l)
								{
									op.state = EG_SUS;
								}

							}
							break;

						case EG_SUS: // sustain phase
							if ((eg_cnt & ((1 << op.eg_sh_d2r) - 1)) == 0)
							{
								op.volume += eg_inc[op.eg_sel_d2r + ((eg_cnt >> op.eg_sh_d2r) & 7)];

								if (op.volume >= MAX_ATT_INDEX)
								{
									op.volume = MAX_ATT_INDEX;
									op.state = EG_OFF;
								}

							}
							break;

						case EG_REL: // release phase
							if ((eg_cnt & ((1 << op.eg_sh_rr) - 1)) == 0)
							{
								op.volume += eg_inc[op.eg_sel_rr + ((eg_cnt >> op.eg_sh_rr) & 7)];

								if (op.volume >= MAX_ATT_INDEX)
								{
									op.volume = MAX_ATT_INDEX;
									op.state = EG_OFF;
								}

							}
							break;
					}
					opIndex ++;
					
					i--;
				} while (i != 0);
			}
		}


		public void YM_advance()
		{
			YM2151Operator op;
			uint i;
			int a;
			int p;

			/* LFO */
			if ((test & 2) != 0)
			{
				lfo_phase = 0;
			}
			else
			{
				lfo_timer += lfo_timer_add;
				if (lfo_timer >= lfo_overflow)
				{
					lfo_timer -= lfo_overflow;
					lfo_counter += lfo_counter_add;
					lfo_phase += (lfo_counter >> 4);
					lfo_phase &= 255;
					lfo_counter &= 15;
				}
			}

			i = lfo_phase;
			/* calculate LFO AM and PM waveform value (all verified on real chip, except for noise algorithm which is impossible to analyse)*/
			switch (lfo_wsel)
			{
				case 0:
					/* saw */
					/* AM: 255 down to 0 */
					/* PM: 0 to 127, -127 to 0 (at PMD=127: LFP = 0 to 126, -126 to 0) */
					a = (int)(255 - i);
					if (i < 128)
					{
						p = (int)i;
					}
					else
					{
						p = (int)(i - 255);
					}
					break;
				case 1:
					/* square */
					/* AM: 255, 0 */
					/* PM: 128,-128 (LFP = exactly +PMD, -PMD) */
					if (i < 128)
					{
						a = 255;
						p = 128;
					}
					else
					{
						a = 0;
						p = -128;
					}
					break;
				case 2:
					/* triangle */
					/* AM: 255 down to 1 step -2; 0 up to 254 step +2 */
					/* PM: 0 to 126 step +2, 127 to 1 step -2, 0 to -126 step -2, -127 to -1 step +2*/
					if (i < 128)
					{
						a = (int)(255 - (i * 2));
					}
					else
					{
						a = (int)((i * 2) - 256);
					}

					if (i < 64) // i = 0..63
					{
						p = (int)(i * 2); // 0 to 126 step +2
					}
					else if (i < 128) // i = 64..127
					{
						p = (int)(255 - i * 2); // 127 to 1 step -2
					}
					else if (i < 192) // i = 128..191
					{
						p = (int)(256 - i * 2); // 0 to -126 step -2
					}
					else // i = 192..255
					{
						p = (int)(i * 2 - 511); //-127 to -1 step +2
					}
					break;
				case 3:
				default: //keep the compiler happy
					/* random */
					/* the real algorithm is unknown !!!
						We just use a snapshot of data from real chip */

					/* AM: range 0 to 255    */
					/* PM: range -128 to 127 */

					a = lfo_noise_waveform[i];
					p = a - 128;
					break;
			}
			lfa = (uint)(a * amd / 128);
			lfp = p * pmd / 128;


			/*  The Noise Generator of the YM2151 is 17-bit shift register.
			*   Input to the bit16 is negated (bit0 XOR bit3) (EXNOR).
			*   Output of the register is negated (bit0 XOR bit3).
			*   Simply use bit16 as the noise output.
			*/
			noise_p += noise_f;
			i = (uint)(noise_p >> 16); // number of events (shifts of the shift register)
			noise_p &= 0xffff;
			while (i != 0)
			{
				uint j;
				j = (uint)(((noise_rng ^ (noise_rng >> 3)) & 1) ^ 1);
				noise_rng = (j << 16) | (noise_rng >> 1);
				i--;
			}


			/* phase generator */
			op = oper[0]; // CH 0 M1
			var opIndex = 0;
			i = 8;
			do
			{
				op = oper[opIndex];
				if (op.pms > 0) // only when phase modulation from LFO is enabled for this channel
				{
					int mod_ind = lfp; // -128..+127 (8bits signed)
					if (op.pms < 6)
					{
						mod_ind >>= (int)(6 - op.pms);
					}
					else
					{
						mod_ind <<= (int)(op.pms - 5);
					}

					if (mod_ind != 0)
					{
						uint kc_channel = (uint)(op.kc_i + mod_ind);
						oper[opIndex+0].phase += (uint)(((freq[kc_channel + oper[opIndex+0].dt2] + oper[opIndex+0].dt1) * oper[opIndex+0].mul) >> 1);
						oper[opIndex+1].phase += (uint)(((freq[kc_channel + oper[opIndex+1].dt2] + oper[opIndex+1].dt1) * oper[opIndex+1].mul) >> 1);
						oper[opIndex+2].phase += (uint)(((freq[kc_channel + oper[opIndex+2].dt2] + oper[opIndex+2].dt1) * oper[opIndex+2].mul) >> 1);
						oper[opIndex+3].phase += (uint)(((freq[kc_channel + oper[opIndex+3].dt2] + oper[opIndex+3].dt1) * oper[opIndex+3].mul) >> 1);
					}
					else // phase modulation from LFO is equal to zero
					{
						oper[opIndex+0].phase += oper[opIndex+0].freq;
						oper[opIndex+1].phase += oper[opIndex+1].freq;
						oper[opIndex+2].phase += oper[opIndex+2].freq;
						oper[opIndex+3].phase += oper[opIndex+3].freq;
					}
				}
				else // phase modulation from LFO is disabled
				{
					oper[opIndex+0].phase += oper[opIndex+0].freq;
					oper[opIndex+1].phase += oper[opIndex+1].freq;
					oper[opIndex+2].phase += oper[opIndex+2].freq;
					oper[opIndex+3].phase += oper[opIndex+3].freq;
				}

				opIndex += 4;
				i--;
			} while (i != 0);


			/* CSM is calculated *after* the phase generator calculations (verified on real chip)
			* CSM keyon line seems to be ORed with the KO line inside of the chip.
			* The result is that it only works when KO (register 0x08) is off, ie. 0
			*
			* Interesting effect is that when timer A is set to 1023, the KEY ON happens
			* on every sample, so there is no KEY OFF at all - the result is that
			* the sound played is the same as after normal KEY ON.
			*/

			if (csm_req > 0) // CSM KEYON/KEYOFF seqeunce request
			{
				if (csm_req == 2) // KEY ON
				{
					op = oper[0]; // CH 0 M1
					i = 32;
					do
					{
						KEY_ON(op, 2);
						opIndex++;
						op = oper[opIndex];
						i--;
					} while (i > 0);
					csm_req = 1;
				}
				else // KEY OFF
				{
					op = oper[0]; // CH 0 M1
					i = 32;
					do
					{
						KEY_OFF(op,unchecked ((byte) ~2));
						opIndex++;
						op = oper[opIndex];
						i--;
					} while (i > 0);
					csm_req = 0;
				}
			}
		}


		/*  Generate samples for one of the YM2151's
*
*   'num' is the number of virtual YM2151
*   '**buffers' is table of pointers to the buffers: left and right
*   'length' is the number of samples that should be generated
*/
		public void YM_stream_update(ushort[] stream, int samples)
		{
			uint i;
			int outl;
			int outr;

#if USE_MAME_TIMERS
		/* ASG 980324 - handled by real timers now */
#else
			if (tim_B > 0)
			{
				tim_B_val -= (samples << TIMER_SH);
				if (tim_B_val <= 0)
				{
					tim_B_val += tim_B_tab[timer_B_index];
					if ((irq_enable & 0x08) != 0)
					{
						int oldstate = (int)(status & 3);
						status |= 2;
						//if ((!oldstate) && (irqhandler)) (*irqhandler)(device, 1);
						if (oldstate == 0)
						{
							YM_irq = 1;
						}
					}
				}
			}
#endif

			for (i = 0; i < samples; i++)
			{
				YM_advance_eg();

				chanout[0] = 0;
				chanout[1] = 0;
				chanout[2] = 0;
				chanout[3] = 0;
				chanout[4] = 0;
				chanout[5] = 0;
				chanout[6] = 0;
				chanout[7] = 0;

				YM_chan_calc(0);
				YM_chan_calc(1);
				YM_chan_calc(2);
				YM_chan_calc(3);
				YM_chan_calc(4);
				YM_chan_calc(5);
				YM_chan_calc(6);
				YM_chan7_calc();

				outl = (int)(chanout[0] & pan[0]);
				outr = (int)(chanout[0] & pan[1]);
				outl += (int)(chanout[1] & pan[2]);
				outr += (int)(chanout[1] & pan[3]);
				outl += (int)(chanout[2] & pan[4]);
				outr += (int)(chanout[2] & pan[5]);
				outl += (int)(chanout[3] & pan[6]);
				outr += (int)(chanout[3] & pan[7]);
				outl += (int)(chanout[4] & pan[8]);
				outr += (int)(chanout[4] & pan[9]);
				outl += (int)(chanout[5] & pan[10]);
				outr += (int)(chanout[5] & pan[11]);
				outl += (int)(chanout[6] & pan[12]);
				outr += (int)(chanout[6] & pan[13]);
				outl += (int)(chanout[7] & pan[14]);
				outr += (int)(chanout[7] & pan[15]);

				outl >>= FINAL_SH;
				outr >>= FINAL_SH;
				if (outl > MAXOUT)
				{
					outl = MAXOUT;
				}
				else if (outl < MINOUT)
				{
					outl = MINOUT;
				}
				if (outr > MAXOUT)
				{
					outr = MAXOUT;
				}
				else if (outr < MINOUT)
				{
					outr = MINOUT;
				}

				stream[2 * i] = (ushort)outl;
				stream[2 * i + 1] = (ushort)outr;

#if USE_MAME_TIMERS
		/* ASG 980324 - handled by real timers now */
#else
				/* calculate timer A */
				if (tim_A > 0)
				{
					tim_A_val -= (1 << TIMER_SH);
					if (tim_A_val <= 0)
					{
						tim_A_val += tim_A_tab[timer_A_index];
						if ((irq_enable & 0x04) != 0)
						{
							int oldstate = (int)(status & 3);
							status |= 1;
							//if ((!oldstate) && (irqhandler)) (*irqhandler)(device, 1);
							if (oldstate == 0)
							{
								YM_irq = 1;
							}
						}
						if ((irq_enable & 0x80) != 0)
						{
							csm_req = 2; // request KEY ON / KEY OFF sequence
						}
					}
				}
#endif
				YM_advance();
			}
		}







		


	}
}
