# ASMFun Back-End Developers Info
**ASM Fun, An assembler development tool, special for noobs!**


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
Install the .net core version 3.0, so run
```sh
 sudo apt-get install dotnet-sdk-3.0
 sudo apt-get install aspnetcore-runtime-3.0
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