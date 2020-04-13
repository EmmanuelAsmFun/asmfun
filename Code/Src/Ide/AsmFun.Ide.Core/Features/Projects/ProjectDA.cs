#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.DataAccess;
using AsmFun.Common.ServiceLoc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.IO.Compression;
using System.Runtime.InteropServices;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Core.Features.SourceCode;

namespace AsmFun.Ide.Core.Features.Projects
{
    // To add :
    // https://github.com/rzo42/x16-tracker?fbclid=IwAR1jE536aA-WVp15BdTMw22WOAQNiukZb8UJEiTHSUWENqb5kZJolLNzwKc
    // https://github.com/rzo42/cx16-meteor-run?fbclid=IwAR202kqzTBw-gIKqvqae9hLNeYjr-AjJdLL8O6xsvd0iQStbzv4woUKkR_Q

    public class ProjectDA : IProjectDA
    {

        private readonly IAsmJSonSerializer serializer;
        private readonly IEmServiceResolverFactory container;
        private readonly IUserSettingsDA userSettingsDA;
        private readonly IProjectSettingsDA projectSettingsDA;

        public ProjectDA(IAsmJSonSerializer serializer, IEmServiceResolverFactory container, IUserSettingsDA userSettingsDA,
            IProjectSettingsDA projectSettingsDA)
        {
            this.serializer = serializer;
            this.container = container;
            this.userSettingsDA = userSettingsDA;
            this.projectSettingsDA = projectSettingsDA;

        }

        public List<ProjectDetail> GetWebProjects()
        {
            var charF = GetFolderSplit();
            return new List<ProjectDetail>
            {
                new ProjectDetail
                {
                    Id = new Guid("{6FE5C1F3-FBC2-4D9A-9FC5-C90504F8E927}"),
                    DeveloperName = "Thrawn",
                    DevPicUrl = "https://asmfun.com/Images/avatar/thrawn/thrawn.gif",
                    Name = "Snake Game",
                    Description = "Snake Game Test development. ",
                    ImageUrl ="https://asmfun.com/projects/DemoGames/ThrawnsSnakeGame.jpg",
                    InternetSourceType = InternetSourceType.ZipUrl,
                    InternetSource = "https://asmfun.com/projects/DemoGames/ThrawnsSnakeGame.zip",
                    InternetVersion="",
                    ProjectUrl = "https://murray2.com/threads/my-snake-program.453/",
                    StartFile = "main.a",
                    RomVersion = "R33",
                    UnderConstruction = true,
                },
                new ProjectDetail
                {
                    Id = new Guid("{1D90A0CF-0F1A-4A7E-B09B-FFB3513A2288}"),
                    DeveloperName = "Erik Dansbo",
                    DevPicUrl = "https://asmfun.com/images/avatar/erik-dansbo/Erik_Dansbo.gif",
                    Name = "TicTacToe",
                    Description = "TicTacToe for the commanderX16. ",
                    ImageUrl="https://asmfun.com/projects/DemoGames/ErikDansbo_TicTacToe.jpg",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/Dansbo/tictactoe",
                    InternetVersion="54e3ca01539980f5d25c49ac3c3178a5dd55ca06",
                    ProjectUrl = "https://github.com/Dansbo/tictactoe",
                    StartFile = "tictactoe.asm",
                    RomVersion = "R36",
                    UnderConstruction = true,
                },
                new ProjectDetail
                {
                    Id = new Guid("{7B49B3C8-0480-4065-A047-043622F31567}"),
                    DeveloperName = "David (8-bit guy)",
                    DevPicUrl = "https://asmfun.com/Images/avatar/david-murray/David-Murray.gif",
                    Name = "Petdraw",
                    Description = "Petdraw for the commanderX16",
                    ImageUrl="https://asmfun.com/projects/DemoGames/David-8-bitGuyPetDraw.jpg",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/commanderx16/x16-demo/tree/master/petdrawx16",
                    InternetVersion = "fd7c3fc9a5caf1e6232acc5f674170fc8e6011db",
                    ProjectUrl = "https://github.com/commanderx16/x16-demo/tree/master/petdrawx16",
                    StartFile = "petdrawx16.asm",
                    RomVersion = "R33",
                    UnderConstruction = false,
                },
                new ProjectDetail
                {
                    Id = new Guid("{001070ED-FE61-4F93-919D-3F9515B3AC55}"),
                    DeveloperName = "Mikko Parviainen",
                    DevPicUrl = "https://asmfun.com/projects/DemoGames/Pixel_Demo.gif",
                    Name = "Pixel Demo",
                    Description = "This demo initializes the VERA graphics mode, clears the screen, and then draws pixels at random positions with random colors. ",
                    ImageUrl="https://asmfun.com/projects/DemoGames/Pixel_Demo.gif",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/mikkoparviainen/commanderx16demos",
                    InternetVersion = "693247378b96ac5a08ec9526104ab7d8d8c5f32a",
                    ProjectUrl = "https://github.com/mikkoparviainen/commanderx16demos",
                    StartFile = $"pixel{charF}pixel.a",
                    AddonBuildFolders = "includes",
                    RomVersion = "R33",
                    UnderConstruction = false,
                }, new ProjectDetail
                {
                    Id = new Guid("{906B9F8A-ED36-460A-974D-3E2E324A61ED}"),
                    DeveloperName = "Stephen Horn",
                    DevPicUrl = "https://asmfun.com/Images/avatar/Stephen_Horn/Stephen_Horn.gif",
                    Name = "Matriculate",
                    Description = "A Matrix-inspired text crawl that totally took me to school.",
                    ImageUrl="https://asmfun.com/projects/DemoGames/Matriculate.gif",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/indigodarkwolf/x16-matriculate-text",
                    InternetVersion = "6d042717fa451f6f3245fb0c94db93ce9a3cdb42",
                    ProjectUrl = "https://github.com/indigodarkwolf/x16-matriculate-text",
                    StartFile = $"matriculate.asm",
                    RomVersion = "R33",
                    UnderConstruction = false,
                    CompilerVariables = " -DMACHINE_C64=0"
                }, new ProjectDetail
                {
                    Id = new Guid("{8462AEDF-FA48-4BF4-82C2-8AFCA65D2922}"),
                    DeveloperName = "Michael Steil",
                    DevPicUrl = "https://asmfun.com/Images/avatar/michael-steil/michael-steil.gif",
                    Name = "Sprite Demo",
                    Description = "Test sprite demo project.",
                    ImageUrl="https://asmfun.com/projects/DemoGames/Sprite-Demo.png",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/commanderx16/x16-demo/tree/master/assembly",
                    InternetVersion = "f3f3c3307c6e013beeea9cd5e5d14552e6166136",
                    ProjectUrl = "https://github.com/commanderx16/x16-demo/tree/master/assembly",
                    StartFile = $"sprite-demo.asm",
                    RomVersion = "R36",
                    UnderConstruction = false,
                    CompilerVariables = " -DMACHINE_C64=0"
                }, new ProjectDetail
                {
                    Id = new Guid("{8FB6E527-3968-4BEC-B8A3-877A0BA878B2}"),
                    DeveloperName = "Michael Steil",
                    DevPicUrl = "https://asmfun.com/Images/avatar/michael-steil/michael-steil.gif",
                    Name = "Tiles Demo",
                    Description = "Tiles test demo project.",
                    ImageUrl="https://asmfun.com/projects/DemoGames/Tiles-Demo.jpg",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/commanderx16/x16-demo/tree/master/assembly",
                    InternetVersion = "f3f3c3307c6e013beeea9cd5e5d14552e6166136",
                    ProjectUrl = "https://github.com/commanderx16/x16-demo/tree/master/assembly",
                    StartFile = $"mode4-demo.asm",
                    RomVersion = "R33",
                    UnderConstruction = false,
                    CompilerVariables = " -DMACHINE_C64=0"
                }, new ProjectDetail
                {
                    Id = new Guid("{5421ADE7-BF38-4B84-932F-44E76C70EE1A}"),
                    DeveloperName = "Jimmy Dansbo",
                    DevPicUrl = "https://asmfun.com/Images/avatar/jimmy-dansbo/jimmy-dansbo.gif",
                    Name = "CX16 Maze",
                    Description = "Game inspired by the Android game Amaze.",
                    ImageUrl="https://asmfun.com/projects/DemoGames/cx16maze.jpg",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/JimmyDansbo/cx16-maze/",
                    InternetVersion = "c9793771b672e650b72ee4cfad22248e588c3cde",
                    ProjectUrl = "https://github.com/JimmyDansbo/cx16-maze/",
                    StartFile = $"cx16maze.asm",
                    RomVersion = "R36",
                    UnderConstruction = false,
                    CompilerVariables = ""
                },
                new ProjectDetail
                {
                    Id = new Guid("{9788F0B9-F8B0-4D35-ACA6-C50AEB5ECEE8}"),
                    DeveloperName = "John Bliss",
                    DevPicUrl = "",
                    Name = "x16-music-player",
                    Description = "Simple way to try out the YM2151 sound chip and Vera PSG on the Commander X16.",
                    ImageUrl="https://asmfun.com/projects/DemoGames/cx16maze.jpg",
                    InternetSourceType = InternetSourceType.GitHub,
                    InternetSource = "https://github.com/jjbliss/x16-music-player",
                    InternetVersion = "fdb7f1e692cad2abc3abe65da85b72ad14865fc0",
                    ProjectUrl = "https://github.com/jjbliss/x16-music-player",
                    StartFile = $"player.asm",
                    RomVersion = "R37",
                    UnderConstruction = false,
                    CompilerVariables = ""
                },               
                //new ProjectDetail
                //{
                //    Id = new Guid("{FA2C5E6D-4D7C-42DE-9206-8691B50E137B}"),
                //    DeveloperName = "Michael Jørgensen",
                //    DevPicUrl = "",
                //    Name = "Assembly Tutorial",
                //    Description = "This is a step-by-step guide for how to write a simple game in assembly for the Commander X16.",
                //    ImageUrl="https://asmfun.com/projects/DemoGames/cx16maze.jpg",
                //    InternetSourceType = InternetSourceType.GitHub,
                //    InternetSource = "https://github.com/MJoergen/x16-assembly-tutorial/tree/master/Episode_7/",
                //    InternetVersion = "6b4cd43aece8e3ce27bc883370c77e47c8c598dd",
                //    ProjectUrl = "https://github.com/MJoergen/x16-assembly-tutorial/tree/master/Episode_7",
                //    StartFile = $"tennis.s",
                //    RomVersion = "R36",
                //    UnderConstruction = false,
                //    CompilerVariables = ""
                //},
                // orking ok
                // https://github.com/JustinBaldock/x16-guides/tree/master/2020-02-GraphicFunctions
                 //  ca65 assembler
                //new ProjectDetail
                //{
                //    Id = new Guid("{B14822A1-61E5-4D03-AF15-929D20E36495}"),
                //    DeveloperName = "StewBC",
                //    DevPicUrl = "",
                //    Name = "Penetrator",
                //    Description = "Penetrator for the commanderX16",
                //    InternetVersion = "2832485d20abdff21744c849af0d057d7abf5952",
                //    ImageUrl="",
                //    InternetSourceType = InternetSourceType.GitHub,
                //    InternetSource = "https://github.com/StewBC/penetrator",
                //    ProjectUrl = "https://github.com/StewBC/penetrator",
                //    StartFile = "src/penetrator.asm",
                //    RomVersion = "R34",
                //},
                //new ProjectDetail
                //{
                //    Id = new Guid("{D5F86D14-B215-4C32-80DD-CB186BAE1A52}"),
                //    DeveloperName = "Matt Heffernan",
                //    DevPicUrl = "https://avatars2.githubusercontent.com/u/56282856?s=400&v=4",
                //InternetVersion = "6d042717fa451f6f3245fb0c94db93ce9a3cdb42",
                //    Name = "Chase Vault",
                //    Description = "Chase Vault for the commanderX16",
                //    ImageUrl="https://github.com/SlithyMatt/x16-chasevault/raw/master/cv9.gif",
                //    InternetSourceType = InternetSourceType.GitHub,
                //    InternetSource = "https://github.com/SlithyMatt/x16-chasevault",
                //    ProjectUrl = "https://github.com/SlithyMatt/x16-chasevault",
                //    StartFile = "chasevault.asm",
                //},

                // ASM6
                // https://murray2.com/threads/wolf3d-like-bitmap-graphics.428/
                // 64tass
                // https://murray2.com/threads/demo-assembly-scrolling-layer0-with-layer-1-hud.369/
                //new ProjectDetail
                //{
                //    Id = new Guid("{14E064ED-6E74-4B0B-BD53-5244FDB0917D}"),
                //    DeveloperName = "Gabriele Tazzari",
                //    DevPicUrl = "https://avatars3.githubusercontent.com/u/1755028?s=400&v=4",
                //InternetVersion = "6d042717fa451f6f3245fb0c94db93ce9a3cdb42",
                //    Name = "Demo",
                //    Description = "Demo programs for the commanderX16",
                //    ImageUrl="",
                //    InternetSourceType = InternetSourceType.GitHub,
                //    InternetSource = "https://github.com/yignoth/x16-pminer",
                //    ProjectUrl = "https://github.com/yignoth/x16-pminer",
                //    StartFile = "x16demo-320x240-7.a",
                //},
                //new ProjectDetail
                //{
                //    Id = new Guid("{3CF2887B-90D7-44DC-BA9B-2ACBD7B59C96}"),
                //    DeveloperName = "Gabriele Tazzari",
                //    DevPicUrl = "https://avatars3.githubusercontent.com/u/1755028?s=400&v=4",
                //InternetVersion = "6d042717fa451f6f3245fb0c94db93ce9a3cdb42",
                //    Name = "Demo",
                //    Description = "Demo programs for the commanderX16",
                //    ImageUrl="",
                //    InternetSourceType = InternetSourceType.GitHub,
                //    InternetSource = "https://github.com/gtchandra/commanderx16-demo",
                //    ProjectUrl = "https://github.com/gtchandra/commanderx16-demo",
                //    StartFile = "x16demo-320x240-7.a",
                //},
                // kick assembler
                // https://github.com/c64skate/commander_x16_samples
               
                
            };
        }

        public ProjectSettings CreateNew(string nameForFileSystem, string developerName, BuildConfiguration buildConfiguration)
        {
            var cleanName = ReplaceInvalidChars(nameForFileSystem);
            if (string.IsNullOrWhiteSpace(cleanName)) return null;
            var projectFolder = EnsureProjectsFolder(cleanName);
            var settings = projectSettingsDA.TryLoadByFolderOrCreate(projectFolder, null);
            settings.Configurations[0] = buildConfiguration;
            settings.Detail.FullFolderName = projectFolder;
            settings.Detail.DeveloperName = developerName;
            projectSettingsDA.Save(settings);
            File.WriteAllText(Path.Combine(projectFolder, "Main.asm"), "!cpu 65c02\r\n\r\n" +
                    ";Basic Command SYS $8010\r\n" +
                " *=$0801\r\n" +
                "    !8 $0E, $08, $0A, $00, $9E, $20, $28, $32, $30 , $36, $34, $29, $00, $00, $00\r\n" +
                " *=$0810\r\n" +
                "\r\n" +
                "\r\n"
                );
            return settings;
        }

        public ProjectSettings LoadBySettings(string settingsFileName)
        {
            var settings = projectSettingsDA.LoadBySettings(settingsFileName);
            return settings;
        }
        public ProjectSettings LoadLocalExisting(string projectFolder)
        {
            return projectSettingsDA.LoadByFolder(projectFolder);
        }


        public ProjectSettings LoadWebExisting(ProjectDetail projectDetail)
        {
            switch (projectDetail.InternetSourceType)
            {
                case InternetSourceType.ZipUrl:
                    return LoadZipFromWeb(projectDetail);
                case InternetSourceType.GitHub:
                    return LoadFromGitHub(projectDetail);
                case InternetSourceType.Bitbucket:
                    return LoadFromBitbucket(projectDetail);
                default:
                    break;
            }
            return null;
        }

        private ProjectSettings LoadZipFromWeb(ProjectDetail projectDetail)
        {
            var projectFolder = PrepareProjectFolder(projectDetail);
            if (string.IsNullOrWhiteSpace(projectFolder)) return null;
            // Check if it's already downloaded
            var fileStart = Path.Combine(projectFolder, projectDetail.StartFile);
            if (File.Exists(fileStart)) return projectSettingsDA.TryLoadByFolderOrCreate(projectFolder, projectDetail.StartFile);

            byte[] sourceData;
            using (var client = new WebClient())
                sourceData = client.DownloadData(projectDetail.InternetSource);
            if (sourceData == null) return null;
            var tempZip = Path.Combine(projectFolder, "temp.zip");
            File.WriteAllBytes(tempZip, sourceData);
            using (var zip1 = ZipFile.OpenRead(tempZip))
            {
                foreach (var e in zip1.Entries)
                    e.ExtractToFile(Path.Combine(projectFolder, e.FullName), true);
            }
            File.Delete(tempZip);
            return TryLoadLocal(projectFolder, projectDetail);
        }

        private ProjectSettings LoadFromGitHub(ProjectDetail projectDetail)
        {
            var projectFolder = PrepareProjectFolder(projectDetail);
            if (string.IsNullOrWhiteSpace(projectFolder)) return null;
            if (string.IsNullOrWhiteSpace(projectDetail.StartFile)) return null;
            // Check if it's already downloaded
            var fileStart = Path.Combine(projectFolder, projectDetail.StartFile);
            if (File.Exists(fileStart)) return projectSettingsDA.TryLoadByFolderOrCreate(projectFolder, projectDetail.StartFile);

            var gitHub = new GitHubDataAccess();
            gitHub.Load(projectFolder, projectDetail);
            return TryLoadLocal(projectFolder, projectDetail);
        }
        private string PrepareProjectFolder(ProjectDetail projectDetail)
        {
            var projectFolderName = ReplaceInvalidChars(projectDetail.Name);
            var projectFolder = EnsureProjectsFolder(projectFolderName);
            return projectFolder;
        }

        private ProjectSettings TryLoadLocal(string projectFolder, ProjectDetail projectDetail)
        {
            var settings = projectSettingsDA.TryLoadByFolderOrCreate(projectFolder, projectDetail.StartFile);
            if (settings == null) return null;
            settings.Detail = projectDetail;
            settings.Detail.FullFolderName = projectFolder;
            settings.Configurations[0].RomVersion = projectDetail.RomVersion;
            settings.Configurations[0].CompilerVariables = projectDetail.CompilerVariables;
            projectSettingsDA.Save(settings);
            return settings;
        }

        private ProjectSettings LoadFromBitbucket(ProjectDetail projectDetail)
        {
            // Todo
            return null;
        }


        private string EnsureProjectsFolder(string projectName)
        {
            var projectFolder = GetProjectsFolder();
            if (string.IsNullOrWhiteSpace(projectFolder)) return null;
            if (string.IsNullOrWhiteSpace(projectName)) return null;
            projectFolder = Path.Combine(projectFolder, projectName);
            if (Directory.Exists(projectFolder)) return projectFolder;
            Directory.CreateDirectory(projectFolder);
            return projectFolder;
        }

        private string GetProjectsFolder()
        {
            var projectFolder = userSettingsDA.Get().ProjectsFolder;
            return projectFolder;
        }
        public string ReplaceInvalidChars(string filename)
        {
            var data = string.Join("_", filename.Trim().Split(Path.GetInvalidFileNameChars()));
            data = data.Replace(" ", "_").Replace("'", "");
            return data;
        }
        private string GetFolderSplit()
        {
            return RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ?
                "\\" : "/";
        }
    }
}
