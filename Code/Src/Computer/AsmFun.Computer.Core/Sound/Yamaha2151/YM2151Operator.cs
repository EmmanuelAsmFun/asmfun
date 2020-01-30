/***************************************************************************
    Yamaha YM2151 driver (version 2.150 final beta) - May, 11th 2002
    
    (c) 1997-2002 Jarek Burczynski (s0246@poczta.onet.pl, bujar@mame.net)
    Some of the optimizing ideas by Tatsuyuki Satoh
    
    This driver is based upon the MAME source code, with some minor 
    modifications to integrate it into the Cannonball framework. 
    
    See http://mamedev.org/source/docs/license.txt for more details.

	Modified in c#
***************************************************************************/

namespace AsmFun.Computer.Core.Sound.Yamaha2151
{
	/// <summary>
	/// Describing a single operator
	/// </summary>
	public class YM2151Operator
    {
		public uint phase; // accumulated operator phase
		public uint freq; // operator frequency count
		public int dt1; // current DT1 (detune 1 phase inc/decrement) value
		public uint mul; // frequency count multiply
		public uint dt1_i; // DT1 index * 32
		public uint dt2; // current DT2 (detune 2) value

		//C++ TO C# CONVERTER TODO TASK: C# does not have an equivalent to pointers to value types:
		//ORIGINAL LINE: int *connects;
		public int connects; // operator output 'direction'

		/* only M1 (operator 0) is filled with this data: */
		//C++ TO C# CONVERTER TODO TASK: C# does not have an equivalent to pointers to value types:
		//ORIGINAL LINE: int *mem_connect;
		public int mem_connect; // where to put the delayed sample (MEM)
		public int mem_value; // delayed sample (MEM) value

		/* channel specific data; note: each operator number 0 contains channel specific data */
		public uint fb_shift; // feedback shift value for operators 0 in each channel
		public int fb_out_curr; // operator feedback value (used only by operators 0)
		public int fb_out_prev; // previous feedback value (used only by operators 0)
		public uint kc; // channel KC (copied to all operators)
		public uint kc_i; // just for speedup
		public uint pms; // channel PMS
		public uint ams; // channel AMS
		/* end of channel specific data */

		public uint AMmask; // LFO Amplitude Modulation enable mask
		public uint state; // Envelope state: 4-attack(AR) 3-decay(D1R) 2-sustain(D2R) 1-release(RR) 0-off
		public byte eg_sh_ar; //  (attack state)
		public byte eg_sel_ar; //  (attack state)
		public uint tl; // Total attenuation Level
		public int volume; // current envelope attenuation level
		public byte eg_sh_d1r; //  (decay state)
		public byte eg_sel_d1r; //  (decay state)
		public uint d1l; // envelope switches to sustain state after reaching this level
		public byte eg_sh_d2r; //  (sustain state)
		public byte eg_sel_d2r; //  (sustain state)
		public byte eg_sh_rr; //  (release state)
		public byte eg_sel_rr; //  (release state)

		public uint key; // 0=last key was KEY OFF, 1=last key was KEY ON

		public uint ks; // key scale
		public uint ar; // attack rate
		public uint d1r; // decay rate
		public uint d2r; // sustain rate
		public uint rr; // release rate

		public uint reserved0;
		public uint reserved1;
	}
}
