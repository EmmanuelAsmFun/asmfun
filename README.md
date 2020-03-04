# ASMFun
**ASM Fun, An assembler development tool, special for noobs!**

Discover here:
https://asmfun.com

I created this as a hobby learning project. 
The userinterface runs in a browser (Typescript), the Commander-X16 runs on a local exe written in .net Core 3.1. For now, it uses the ACME compiler, but everything is prepared for other compilers.

# for Commander-X16
This project is specially build for the Commander-X16, David Murray, the 8-bit Guy.
https://murray2.com/forums/commander-x16.9/

![Image of ASMFun](https://asmfun.com/images/screenshots/screenshot-commanderX16.jpg)

# Nice Features
### IDE
- Code Editor
- Code Assist
- Instant Opcode Translator
- Label/Zone/Variable search
- Compile On Save
- Find And replace
- Easy Variable, Macro's and Label Links, navigate or find all usages.


### Emulator
- Embedded Emulator
- Prg instant in memory on save
- Backwads compatible Roms

### Debugger
- Memory inspector
- Video Memory inspector
- Instant Memory Edit
- Multi breakpoint debugger
- Variable inspector and instant editable
- Basic dissasembly

### Video
- Vera inspector
- Instant property edit end bytes preview
- Drag layers and Sprites
- Color palette inspector
- Tile inspector




![Image of ASMFun](https://asmfun.com/images/info/CodeAssistHome.gif)


# About
I always wanted to understand how assembler worked. Never learned it, or just the basics at school 20 years ago.
As a child on DOS and Commodore 64 computers, I never understood how they created games without Basic. It was a complete mystery, how is this possible??!!
So the curious little child in me has always been hungry to know. Now, many years later, I want to give my inner little boy what he has always been wanting to know: How to write assembler Language?! :-)

I have been inspired by David Murray, known as the 8-bit Guy who wanted to create the dream retro computer: the Commander X16. I then downloaded the emulator from Michael Steil and community and wanted to start development. It was so hard to understand to simply get started. After some days of reading I was finally able to find an ide, but the compiler was not there. It was so much anoying stuff, just to start working...
Then I thought, why not make an IDE that simply does all what's needed to get started directly. I will have to learn Assembler, and I will have to learn everyhing to be able to design an IDE. And so I started creating ASM Fun for Commander X16 :-).
PS. : I have multiple years of dev experience in high level languages.

In life, the most important is joy. I will always seek for the feeling of joy, in whatever way, and put it on the first place. When I do this, I have observed that the people around me are feeling the joy too.
That's what I want to give.

Emmanuel


# Rules I set up for myself
To learn as much as possible, I don't want to use any library, or only if it's really needed.
Now I only used:
##### Front-end:
- Vue
##### Back-end:
- SDL 


# Features coming
- Variable renaming

- cc65 compiler : More features
- Tile and Map painter
- Labels in memory viewer
- more instant doc information
- and more.... 

You have ideas or missing features? Tell me.


# Install on linux

### Install the SDL Library
sudo apt-get install libsdl2-2.0

OR
Get sourcecode SDL
open root folder in terminal
type 
./configure
make all

## Set the projects folder
Before starting it's best to set the projects folder in the settings, this can be whathever folder you like.

## For SourceCode
Follow the steps on microsofts website
https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-ubuntu-1804
Install the .net core version 3.1, so run
```sh
 sudo apt-get install dotnet-sdk-3.1
 sudo apt-get install aspnetcore-runtime-3.1
 sudo apt-get install dotnet-runtime-3.1
````


- In the VS Code menu, go into File / Preferences / Settings.
- In the "Search settings" window, type omnisharp.path
- Click on "Edit in settings.json" link.
```sh
{
    "workbench.iconTheme": "material-icon-theme",
    "editor.tabSize": 2,
    "omnisharp.path": "latest"
}
````

### ACME Compiler
download the source
https://github.com/meonwax/acme
goto /src/ folder
run the command:
make all

Open the ASMFun page and go to settings.
set the ACME folder in the settings where you build the acme compiler.
....../acme-master/src/acme


use the AsmFunSDL.sln for mac and linux

# MAC Installation
Install sdl library
https://www.libsdl.org/download-2.0.php
