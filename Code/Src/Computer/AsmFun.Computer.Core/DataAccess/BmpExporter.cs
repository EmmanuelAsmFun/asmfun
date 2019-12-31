using System;
using System.IO;
using System.Runtime.InteropServices;

namespace AsmFun.Computer.Core.DataAccess
{
	public class BmpExporter
	{


		public struct BITMAPFILEHEADER //*** BMP file header structure ***
		{
			public uint bfSize; // Size of file
			public ushort bfReserved1; // Reserved
			public ushort bfReserved2; // ...
			public uint bfOffBits; // Offset to bitmap data
		}
		public struct BITMAPINFOHEADER //*** BMP file info structure ***
		{
			public uint biSize; // Size of info header
			public int biWidth; // Width of image
			public int biHeight; // Height of image
			public ushort biPlanes; // Number of color planes
			public ushort biBitCount; // Number of bits per pixel
			public uint biCompression; // Type of compression to use
			public uint biSizeImage; // Size of image data
			public int biXPelsPerMeter; // X pixels per meter
			public int biYPelsPerMeter; // Y pixels per meter
			public uint biClrUsed; // Number of colors used
			public uint biClrImportant; // Number of important colors
		}


		public BmpExporter(byte[] img, int width, int height,string fileName)
		{


			BITMAPFILEHEADER bfh = new BITMAPFILEHEADER();
			BITMAPINFOHEADER bih = new BITMAPINFOHEADER();

			/* Magic number for file. It does not fit in the header structure due to alignment requirements, so put it outside */
			ushort bfType = 0x4d42;
			bfh.bfReserved1 = 0;
			bfh.bfReserved2 = 0;
			//bfh.bfSize = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER) + width * height * 4;
			bfh.bfSize = (uint)(12 + 40 + width * height * 4);
			bfh.bfOffBits = 0x36;

			bih.biSize = 40; // sizeof(BITMAPINFOHEADER);
			bih.biWidth = width;
			bih.biHeight = height;
			bih.biPlanes = 1;
			bih.biBitCount = 32;
			bih.biCompression = 0;
			bih.biSizeImage = 0;
			bih.biXPelsPerMeter = 5000;
			bih.biYPelsPerMeter = 5000;
			bih.biClrUsed = 0;
			bih.biClrImportant = 0;

			using (var file = File.Open(fileName, FileMode.CreateNew))
			{
				if (file == null)
				{
					Console.Write("Could not write file\n");
					return;
				}
				int size = width * height * 4;
				/*Write headers*/
				var datas = BitConverter.GetBytes(bfType);
				file.Write(datas, 0, datas.Length);
				datas = GetBytes(bfh);
				file.Write(datas, 0, datas.Length);
				datas = GetBytes(bih);
				file.Write(datas, 0, datas.Length);
				file.Write(img, 0, img.Length);
				file.Close();
				file.Dispose();
			}
		}

		private byte[] GetBytes(BITMAPFILEHEADER str)
		{
			int size = Marshal.SizeOf(str);
			byte[] arr = new byte[size];

			IntPtr ptr = Marshal.AllocHGlobal(size);
			Marshal.StructureToPtr(str, ptr, true);
			Marshal.Copy(ptr, arr, 0, size);
			Marshal.FreeHGlobal(ptr);
			return arr;
		}
		private byte[] GetBytes(BITMAPINFOHEADER str)
		{
			int size = Marshal.SizeOf(str);
			byte[] arr = new byte[size];

			IntPtr ptr = Marshal.AllocHGlobal(size);
			Marshal.StructureToPtr(str, ptr, true);
			Marshal.Copy(ptr, arr, 0, size);
			Marshal.FreeHGlobal(ptr);
			return arr;
		}

	}
}
