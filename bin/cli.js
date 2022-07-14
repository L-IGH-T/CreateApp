#!/usr/bin/env node
const { execSync,spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

if (process.argv.length < 3) {
    console.log('');
    console.log('');
    console.log('Please specify the project directory.');
    console.log('');
    console.log('For example :');
    console.log('    npx \x1b[36mL-IGH-T/CreateApp \x1b[33mmy-app \x1b[0m');
    process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
let projectPath,git_repo;
let db = process.argv.find((arg,i) => arg.includes('-b:') || arg.includes('-db'));
let repo = process.argv.find((arg,i) => arg.includes('-repo:'));
const NPM = process.argv.find((arg,i) => arg.includes('-npm'));
if(repo && repo != "")
{
    repo = repo.replace('-repo:','').trim();
    projectPath = path.join(currentPath, projectName);
    git_repo = "https://github.com/L-IGH-T/"+repo+".git";
}
else
{
    process.exit(1);
}
try {
    fs.mkdirSync(projectPath);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(`The file ${projectName} already exist in the current directory.`);
      postProcess();
      console.log('     The installation is \x1b[32mdone\x1b[0m and ready to use !');
    } else {
      console.log(err);
    }
    process.exit(1);
  }

async function main() {
  try {
    console.log('');
    console.log('     \x1b[34mDownloading files...\x1b[0m');
    execSync(`git clone --depth 1 ${git_repo} ${projectPath}`,{stdio: 'inherit'});

    process.chdir(projectPath);
    editJson(projectPath,projectName);
    console.log('');
    console.log('     \x1b[32mInstalling dependencies...\x1b[0m');
    let run = 'npm';
    if(checkYarn() && !NPM)
    {
      run = "yarn";
    }
    execSync(run + ' install',{stdio: 'inherit'});

    console.log('     \x1b[31mRemoving useless files\x1b[0m');
    execSync('npx rimraf ./.git',{stdio: 'inherit'});
    let bin = path.join(projectPath, 'bin');
    if(fs.existsSync(bin))
    {
      fs.rmdirSync(bin, { recursive: true});
    }

    /* Install things */
    postProcess();

    console.log('     The installation is \x1b[32mdone\x1b[0m and ready to use !');
  } catch (error) {
    console.log(error);
  }
}

main();

async function postProcess(){
  try {
    
    console.log('     \x1b[32mStarting postProcess...\x1b[0m');
    process.chdir(projectPath);
    if(db)
    {
        db = db.replace(/-b:|-db:|-db/g,'').trim();
        let folderName = db || "backend";
        if(!fs.existsSync(folderName))
        {
          git_repo = "https://github.com/L-IGH-T/backend.git";
          console.log('');
          console.log('     \x1b[34mDownloading backend...\x1b[0m');
          execSync(`git clone --depth 1 ${git_repo} ./${folderName}`,{stdio: 'inherit'});
          console.log('     \x1b[31mRemoving useless files\x1b[0m');
          execSync(`npx rimraf ./${folderName}/.git`,{stdio: 'inherit'});
        }
        else
        {
          console.log('');
          console.log('     \x1b[31mFolder already exist. \n  \x1b[34m   Skipping...\x1b[0m \n')
        }
    }
  } catch (error) {
    console.log(error);
  }
}


function editJson(packagesDir,name) { 
  const packageJson = path.join(packagesDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    json.name = nameSanitize(name);
    fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  }
}

function nameSanitize(string){
  return string.charAt(0).toLowerCase() + string.slice(1).replace(/[A-Z]/g, function(e) {
    return '-'+e.toLowerCase();
  }).replace(/[0-9]/g, '');
}

function checkYarn(){
  const packageName = "yarn";
  const whyBuffer = spawnSync ('npm', ['list','-g',packageName]);
  return whyBuffer.stdout.toString().includes(packageName);
}