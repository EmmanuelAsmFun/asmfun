#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Ide;
using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AsmFun.WebServer.Controllers
{
    public class ProjectController : Controller
    {
        private readonly IProjectManager projectManager;
        private readonly IUserSettingsDA userSettingsDA;
        private readonly IEmServiceResolver resolver;
        private readonly ICompilerManager compilerManager;
        private readonly ISourceCodeManager sourceCodeManager;

        public ProjectController(IProjectManager projectManager,  IUserSettingsDA userSettingsDA, IEmServiceResolver resolver, ICompilerManager compiler,
            ISourceCodeManager sourceCodeManager)
        {
            this.sourceCodeManager = sourceCodeManager;
            this.projectManager = projectManager;
            this.userSettingsDA = userSettingsDA;
            this.resolver = resolver;
            this.compilerManager = compiler;
        }

        [HttpGet]
        public UserSettings GetUserSettings()
        {
            return userSettingsDA.Get();
        }

        [HttpGet]
        public ProjectSettings GetProjectSettings()
        {
            var settings = projectManager.GetCurrentProjectSettings();
            return settings;
        }

        [HttpPost]
        public object SaveProjectSettings([FromBody] ProjectSettings projectSettings)
        {
            var settings = projectManager.GetCurrentProjectSettings();
            settings.Folder = projectSettings.Folder;
            settings.SourceCodeFolder = projectSettings.SourceCodeFolder;
            settings.Configurations = projectSettings.Configurations;
            projectManager.SaveProjectSettings(settings);
            return new { isValid = true };
        }

        [HttpPost]
        public object SaveUserSettings([FromBody] UserSettings userSettings)
        {
            var settings = userSettingsDA.Get();
            settings.Parse(userSettings);
            userSettingsDA.Save(settings);
            var fac = ((IEmServiceResolverFactory)resolver);
            fac.Update(userSettings);
            UserSettings.UpdateCompilers(fac, userSettings);
            return new { isValid = true };
        }

        [HttpGet]
        public SourceCodeBundle GetSourceCode()
        {
            var data = sourceCodeManager.GetSourceCode();
            return data;
        }

        [HttpGet]
        public async Task<ProjectSettings> LoadByFileSelectorPopup()
        {
            var projectSettings = await projectManager.LoadByFileSelectorPopupAsync();
            return projectSettings;
        } 

        [HttpGet]
        public ProjectSettings LoadByMainFilename(string mainFileNameWithFolder)
        {
            var projectSettings = projectManager.LoadByMainFilename(mainFileNameWithFolder);
            return projectSettings;
        } 
        [HttpGet]
        public ProjectSettings LoadProgram(string programFileName)
        {
            var projectSettings = projectManager.LoadProgram(programFileName);
            return projectSettings;
        }
       
        [HttpGet]
        public CompilaterResult Compile()
        {
            var response = compilerManager.Compile();
            return response;
        }

        [HttpGet]
        public CompilaterResult LoadCompiled()
        {
            CompilaterResult response = compilerManager.Compile();
            response.SourceCodeBundle = sourceCodeManager.GetSourceWithCompiledAddresses();
            projectManager.LoadProgramInPC();
            return response;
        }

        [HttpPost]
        public object Save([FromBody] SourceCodeBundle bundle)
        {
            sourceCodeManager.Save(bundle);
            return new { isValid = true };
        }

        [HttpPost]
        public ProjectSettings CreateNew(string nameForFileSystem,string developerName, [FromBody] BuildConfiguration buildConfiguration)
        {
            return projectManager.CreateNew(nameForFileSystem, developerName,buildConfiguration);
        } 
        
        [HttpPost]
        public ProjectSettings LoadWebExisting([FromBody] ProjectDetail projectDetail)
        {
            return projectManager.LoadWebExisting(projectDetail);
        }
        
        [HttpPost]
        public ProjectSettings LoadLocalExisting([FromBody] ProjectDetail projectDetail)
        {
            var projectFolder = projectDetail.FullFolderName;
            return projectManager.LoadLocalExisting(projectFolder);
        }

        [HttpGet]
        public List<ProjectDetail> GetWebProjects()
        {
            return projectManager.GetWebProjects();
        } 

        [HttpGet]
        public object SelectBuildConfigurationByIndex(int index)
        {
            projectManager.SelectBuildConfigurationByIndex(index);
            return new { isValid = true };
        }
    }
}
