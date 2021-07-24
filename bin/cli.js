#!/usr/bin/env node
const { execSync } = require('child_process');
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
let db = process.argv.find((arg,i) => arg.includes('-b:'));
let repo = process.argv.find((arg,i) => arg.includes('-repo:'));
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
      console.log(`The file ${projectName} already exist in the current directory, please give it another name.`);
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
    console.log('');
    console.log('     \x1b[32mInstalling dependencies...\x1b[0m');
    execSync('npm install',{stdio: 'inherit'});

    console.log('     \x1b[31mRemoving useless files\x1b[0m');
    execSync('npx rimraf ./.git',{stdio: 'inherit'});
    fs.rmdirSync(path.join(projectPath, 'bin'), { recursive: true});
    if(db)
    {
        db = db.replace('-b:','').trim();
        let folderName = db || "backend";
        git_repo = "https://github.com/L-IGH-T/backend.git";
        console.log('');
        console.log('     \x1b[34mDownloading backend...\x1b[0m');
        execSync(`git clone --depth 1 ${git_repo} ./${folderName}`,{stdio: 'inherit'});
        console.log('     \x1b[31mRemoving useless files\x1b[0m');
        execSync(`npx rimraf ./${folderName}/.git`,{stdio: 'inherit'});
    }
    console.log('     The installation is \x1b[32mdone\x1b[0m and ready to use !');
  } catch (error) {
    console.log(error);
  }
}
main();
