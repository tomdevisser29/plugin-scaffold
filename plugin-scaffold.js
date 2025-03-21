#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");

program
  .name("plugin-scaffold")
  .version("0.0.1")
  .description("A plugin scaffold for creating new plugins");

program
  .command("create <name>")
  .description("Create a new plugin")
  .action((name) => {
    const slug = name.toLowerCase().replace(/\s/g, "-");
    const constant_prefix = name.toUpperCase().replace(/\s/g, "_");
    const function_prefix = name.toLowerCase().replace(/\s/g, "_");
    console.log(`Creating new plugin: ${name} (${slug}, ${constant_prefix})`);

    // Check if the plugin already exists
    const destination = path.join(process.cwd(), slug);
    if (fs.existsSync(destination)) {
      console.error(`Plugin already exists: ${destination}`);
      process.exit(1);
    }

    // Download the template files from the repository
    const repository = "https://github.com/tomdevisser29/plugin-template.git";
    console.log(`Cloning repository: ${repository} to ${destination}`);
    const { execSync } = require("child_process");
    execSync(`git clone ${repository} ${destination}`);

    // Remove the .git folder
    const gitPath = path.join(destination, ".git");
    console.log(`Removing .git folder: ${gitPath}`);
    fs.rmdirSync(gitPath, { recursive: true });

    // Change the file plugin.php to slug.php
    const oldPath = path.join(destination, "plugin.php");
    const newPath = path.join(destination, `${slug}.php`);
    fs.renameSync(oldPath, newPath);

    // Replace the placeholders in all the files in the new plugin
    const files = fs.readdirSync(destination);
    files.forEach((file) => {
      const filePath = path.join(destination, file);
      let content = fs.readFileSync(filePath, "utf8");
      content = content.replace(/PLUGIN_NAME/g, constant_prefix);
      content = content.replace(/plugin_name/g, function_prefix);
      content = content.replace(/plugin-name/g, slug);
      content = content.replace(/Plugin_Name/g, name);
      fs.writeFileSync(filePath, content);
    });
  });

program.parse();
