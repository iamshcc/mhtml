import fs from "node:fs";
import path from "node:path";

(async () => {
  const srcDir = "./src";
  const componentsDir = "./src/components";
  const buildDir = "./build";

  // Ensure the build directory exists
  if (!fs.existsSync(buildDir)) {
    await fs.promises.mkdir(buildDir, { recursive: true });
  }

  const allFiles = await fs.promises.readdir(srcDir);
  const allComponents = await fs.promises.readdir(componentsDir);

  let allModuleHtmlFiles = allFiles.filter((item) => item.endsWith(".module.html"));
  let allModuleHtmlComponents = allComponents.filter((item) => item.endsWith(".module.html"));

  console.log("Files: ", allModuleHtmlFiles);
  console.log("Components: ", allModuleHtmlComponents);

  // Function to replace component tags with their content
  const replaceComponentTags = async (filePath) => {
    let content = await fs.promises.readFile(filePath, "utf-8");

    // Regex to match <component:... /> tags
    const componentRegex = /<component:([\w-]+)\s*\/>/g;

    // Find all component tags in the file
    const matches = content.matchAll(componentRegex);

    for (const match of matches) {
      const componentName = match[1]; // Extract the component name
      const componentFilePath = path.join(componentsDir, `${componentName}.module.html`);

      // Check if the component file exists
      if (allModuleHtmlComponents.includes(`${componentName}.module.html`)) {
        const componentContent = await fs.promises.readFile(componentFilePath, "utf-8");
        // Replace the component tag with the component's content
        content = content.replace(match[0], componentContent);
      } else {
        console.warn(`Component "${componentName}" not found in ${componentsDir}`);
      }
    }

    return content; // Return the processed content
  };

  // Process each .module.html file in the src directory
  for (const file of allModuleHtmlFiles) {
    const filePath = path.join(srcDir, file);
    const processedContent = await replaceComponentTags(filePath);

    // Save the processed content to the build directory with a .html extension
    const outputFileName = path.basename(file, ".module.html") + ".html";
    const outputFilePath = path.join(buildDir, outputFileName);

    await fs.promises.writeFile(outputFilePath, processedContent, "utf-8");
    console.log(`Saved ${outputFilePath}`);
  }
})();