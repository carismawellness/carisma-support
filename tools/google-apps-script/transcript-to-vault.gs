/**
 * Google Apps Script: Auto-convert tl;dv meeting transcripts to markdown
 *
 * Watches the tl;dv Google Docs folder and converts new transcripts
 * to .md files in your Obsidian vault's miscellaneous/meetings/raw/ folder.
 *
 * SETUP:
 * 1. Go to script.google.com → New Project
 * 2. Paste this entire script
 * 3. Run setup() once (select "setup" from dropdown, click Run)
 * 4. Authorize when prompted (click Advanced → Go to project)
 * 5. Done. Runs every hour automatically.
 */

// === CONFIGURATION ===
// No manual IDs needed. The script finds everything by folder path.

// Name of the folder tl;dv creates on your Drive
var SOURCE_FOLDER_NAME = "tl;dv Meetings";

// Path to your miscellaneous/meetings/raw/ folder (navigated from Drive root)
var TARGET_PATH = ["Carisma Wellness Group", "Carisma AI ", "Carisma AI", "miscellaneous", "meetings", "raw"];

// Track which files we've already processed
var PROCESSED_KEY = "processedTranscripts";

// === MAIN FUNCTION ===

function processNewTranscripts() {
  // Find source folder (where tl;dv saves Google Docs)
  var sourceFolder = findFolderByName(SOURCE_FOLDER_NAME);
  if (!sourceFolder) {
    Logger.log("Source folder '" + SOURCE_FOLDER_NAME + "' not found. Make sure tl;dv Google Docs integration is enabled.");
    return;
  }

  // Find target folder by navigating the path
  var targetFolder = findFolderByPath(TARGET_PATH);
  if (!targetFolder) {
    Logger.log("Target folder not found at path: " + TARGET_PATH.join("/"));
    Logger.log("Creating the folder path...");
    targetFolder = createFolderPath(TARGET_PATH);
    if (!targetFolder) {
      Logger.log("ERROR: Could not create target folder. Check Drive permissions.");
      return;
    }
  }

  var processed = getProcessedList();
  var files = sourceFolder.getFiles();
  var newCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    var fileId = file.getId();

    // Skip already processed files
    if (processed.indexOf(fileId) !== -1) continue;

    // Only process Google Docs (not recordings, images, etc.)
    if (file.getMimeType() !== "application/vnd.google-apps.document") continue;

    try {
      var doc = DocumentApp.openById(fileId);
      var title = doc.getName();
      var body = doc.getBody().getText();

      // Create a clean filename
      var date = Utilities.formatDate(file.getDateCreated(), "Europe/Malta", "yyyy-MM-dd");
      var slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
      var filename = date + "-" + slug + ".md";

      // Format as markdown
      var markdown = "# " + title + "\n\n";
      markdown += "**Date:** " + date + "\n";
      markdown += "**Source:** tl;dv auto-transcript\n";
      markdown += "**Original:** [Google Doc](https://docs.google.com/document/d/" + fileId + ")\n\n";
      markdown += "---\n\n";
      markdown += body;

      // Save to target folder
      var blob = Utilities.newBlob(markdown, "text/markdown", filename);
      targetFolder.createFile(blob);

      // Mark as processed
      processed.push(fileId);
      newCount++;

      Logger.log("Processed: " + filename);
    } catch (e) {
      Logger.log("Error processing " + file.getName() + ": " + e.message);
    }
  }

  saveProcessedList(processed);
  Logger.log("Done. Processed " + newCount + " new transcript(s).");
}

// === HELPER FUNCTIONS ===

function findFolderByName(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : null;
}

function findFolderByPath(pathParts) {
  var current = DriveApp.getRootFolder();
  for (var i = 0; i < pathParts.length; i++) {
    var folders = current.getFoldersByName(pathParts[i]);
    if (!folders.hasNext()) return null;
    current = folders.next();
  }
  return current;
}

function createFolderPath(pathParts) {
  var current = DriveApp.getRootFolder();
  for (var i = 0; i < pathParts.length; i++) {
    var folders = current.getFoldersByName(pathParts[i]);
    if (folders.hasNext()) {
      current = folders.next();
    } else {
      current = current.createFolder(pathParts[i]);
    }
  }
  return current;
}

function getProcessedList() {
  var props = PropertiesService.getScriptProperties();
  var data = props.getProperty(PROCESSED_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProcessedList(list) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(PROCESSED_KEY, JSON.stringify(list));
}

// === SETUP (Run once) ===

function setup() {
  // Delete any existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Verify folders exist
  Logger.log("Checking source folder: " + SOURCE_FOLDER_NAME);
  var source = findFolderByName(SOURCE_FOLDER_NAME);
  if (source) {
    Logger.log("  Found: " + source.getName());
  } else {
    Logger.log("  NOT FOUND — tl;dv Google Docs integration not yet enabled. The script will start working once tl;dv creates this folder.");
  }

  Logger.log("Checking target folder: " + TARGET_PATH.join("/"));
  var target = findFolderByPath(TARGET_PATH);
  if (target) {
    Logger.log("  Found: " + target.getName());
  } else {
    Logger.log("  NOT FOUND — will create on first run.");
  }

  // Create hourly trigger
  ScriptApp.newTrigger("processNewTranscripts")
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log("");
  Logger.log("Trigger created. Script will check for new transcripts every hour.");
  Logger.log("Setup complete.");
}
