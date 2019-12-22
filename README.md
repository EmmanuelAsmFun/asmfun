# ASMFun
**ASM Fun, An assembler development tool, special for noobs!**

Discover here:
https://asmfun.com

I created this as a hobby learning project. 
The userinterface runs in a browser (Typescript), the Commander-X16 runs on a local exe written in .net Core 3.0. For now, it uses the ACME compiler, but everything is prepared for other compilers.

# for Commander-X16
This project is specially build for the Commander-X16.

![Image of ASMFun](https://asmfun.com/images/screenshots/screenshot-commanderX16.jpg)

# Nice Features
- Debugger
- Memory Inspector
- Instant Opcode Translator
- Memory Viewer
- Embedded Amulator
- Instant value change
- Helper info about the current opcode

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
- Windows: None :-) jihaa!
- Linux/Max: SDL 


# Front-End info
All the code can be found in the folder:
```sh
/Code/Src/Ide/AsmFun.BrowserPages/www
````
You can use whathever webserver you want. It's written with Typescript and Vue.

The most important folders with all the core logic are:
```sh
 /Code/Src/Ide/AsmFun.BrowserPages/www/app/core/             // All the core classes
 /Code/Src/Ide/AsmFun.BrowserPages/www/app/interpreters/     // ACME compiler, or later others
 /Code/Src/Ide/AsmFun.BrowserPages/www/app/ui/               // userinterface stuff
```


# Back-end info
Need to clean up first, will come later...



All help is welcome :-)






