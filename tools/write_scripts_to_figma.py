#!/usr/bin/env python3
"""
Write Ad Scripts to Figma Artboards
===================================

Pushes generated ad scripts into Figma text layers for visual review and production.

Usage:
    python tools/write_scripts_to_figma.py --file FILE_KEY --scripts SCRIPTS_JSON

Requirements:
    - FIGMA_ACCESS_TOKEN in .env
    - Figma file with properly named text layers

Example:
    python tools/write_scripts_to_figma.py \
        --file "ABC123XYZ" \
        --scripts ".tmp/scripts/medical_weight_loss_scripts.json"
"""

import os
import sys
import json
import argparse
import requests
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

FIGMA_ACCESS_TOKEN = os.getenv("FIGMA_ACCESS_TOKEN")
FIGMA_API_BASE = "https://api.figma.com/v1"


class FigmaScriptWriter:
    """Writes ad scripts to Figma text layers."""

    def __init__(self, access_token: str):
        """Initialize with Figma access token."""
        if not access_token:
            raise ValueError("FIGMA_ACCESS_TOKEN not found in .env")

        self.access_token = access_token
        self.headers = {
            "X-Figma-Token": access_token,
            "Content-Type": "application/json"
        }

    def get_file(self, file_key: str) -> Dict:
        """Fetch Figma file data."""
        url = f"{FIGMA_API_BASE}/files/{file_key}"
        response = requests.get(url, headers=self.headers)

        if response.status_code != 200:
            raise Exception(f"Failed to fetch Figma file: {response.text}")

        return response.json()

    def find_text_layers(self, node: Dict, text_layers: List[Dict] = None) -> List[Dict]:
        """Recursively find all text layers in Figma file."""
        if text_layers is None:
            text_layers = []

        # Check if current node is a text layer
        if node.get("type") == "TEXT":
            text_layers.append({
                "id": node["id"],
                "name": node["name"],
                "characters": node.get("characters", "")
            })

        # Recursively search children
        if "children" in node:
            for child in node["children"]:
                self.find_text_layers(child, text_layers)

        return text_layers

    def update_text_layer(self, file_key: str, node_id: str, text: str) -> bool:
        """
        Update a text layer in Figma.

        Note: Figma's REST API has limited write capabilities.
        This function uses Figma's plugin API approach via REST.

        IMPORTANT: Figma's public REST API does NOT support direct text updates.
        This is a limitation of Figma's API, not this tool.

        Workarounds:
        1. Use Figma Plugin (recommended for production)
        2. Use Figma Variables (bind text to variables, update variables via API)
        3. Manual copy-paste from generated JSON

        For now, this function generates a JSON file that can be:
        - Imported via a Figma plugin
        - Manually copied into Figma
        - Used with Figma Variables API (when available)
        """
        print(f"⚠️  Figma's REST API does not support direct text updates.")
        print(f"   Generating JSON for manual import or plugin use.")
        return False

    def generate_script_mapping(
        self,
        file_key: str,
        scripts: List[Dict],
        layer_name_pattern: str = "Script_"
    ) -> Dict:
        """
        Generate a mapping of scripts to Figma text layers.

        Args:
            file_key: Figma file key
            scripts: List of script objects with 'name' and 'content'
            layer_name_pattern: Prefix to identify script text layers

        Returns:
            Mapping of layer names to script content
        """
        # Fetch Figma file
        print(f"📥 Fetching Figma file: {file_key}")
        file_data = self.get_file(file_key)

        # Find all text layers
        print("🔍 Finding text layers in Figma file...")
        text_layers = []
        for page in file_data["document"]["children"]:
            self.find_text_layers(page, text_layers)

        # Filter layers matching pattern
        script_layers = [
            layer for layer in text_layers
            if layer["name"].startswith(layer_name_pattern)
        ]

        print(f"✅ Found {len(script_layers)} script layers in Figma")

        # Create mapping
        mapping = {}
        for i, script in enumerate(scripts):
            layer_name = f"{layer_name_pattern}{i+1}"
            matching_layer = next(
                (layer for layer in script_layers if layer["name"] == layer_name),
                None
            )

            if matching_layer:
                mapping[layer_name] = {
                    "node_id": matching_layer["id"],
                    "script_name": script.get("name", f"Script {i+1}"),
                    "content": script.get("content", ""),
                    "current_text": matching_layer["characters"]
                }
            else:
                print(f"⚠️  No matching layer found for: {layer_name}")

        return mapping

    def export_for_plugin(self, mapping: Dict, output_path: str):
        """Export script mapping as JSON for Figma plugin import."""
        plugin_data = {
            "version": "1.0",
            "scripts": [
                {
                    "layerName": layer_name,
                    "nodeId": data["node_id"],
                    "scriptName": data["script_name"],
                    "content": data["content"]
                }
                for layer_name, data in mapping.items()
            ]
        }

        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(plugin_data, f, indent=2, ensure_ascii=False)

        print(f"📄 Exported script mapping to: {output_path}")
        print(f"   Use this file with the Figma plugin to import scripts.")

        return output_path


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(
        description="Write ad scripts to Figma artboards"
    )
    parser.add_argument(
        "--file",
        required=True,
        help="Figma file key (from URL: figma.com/file/FILE_KEY/...)"
    )
    parser.add_argument(
        "--scripts",
        required=True,
        help="Path to JSON file with scripts (list of {name, content})"
    )
    parser.add_argument(
        "--layer-pattern",
        default="Script_",
        help="Text layer name pattern (default: Script_)"
    )
    parser.add_argument(
        "--output",
        default=".tmp/scripts/figma_import.json",
        help="Output path for plugin import JSON"
    )

    args = parser.parse_args()

    # Validate inputs
    if not FIGMA_ACCESS_TOKEN:
        print("❌ Error: FIGMA_ACCESS_TOKEN not found in .env")
        print("   Add your Figma personal access token to .env file")
        sys.exit(1)

    scripts_path = Path(args.scripts)
    if not scripts_path.exists():
        print(f"❌ Error: Scripts file not found: {args.scripts}")
        sys.exit(1)

    # Load scripts
    print(f"📖 Loading scripts from: {args.scripts}")
    with open(scripts_path, 'r', encoding='utf-8') as f:
        scripts = json.load(f)

    if not isinstance(scripts, list):
        print("❌ Error: Scripts JSON must be a list of objects")
        sys.exit(1)

    print(f"✅ Loaded {len(scripts)} scripts")

    # Initialize writer
    writer = FigmaScriptWriter(FIGMA_ACCESS_TOKEN)

    # Generate mapping
    try:
        mapping = writer.generate_script_mapping(
            file_key=args.file,
            scripts=scripts,
            layer_name_pattern=args.layer_pattern
        )

        # Export for plugin import
        output_path = writer.export_for_plugin(mapping, args.output)

        print("\n" + "="*60)
        print("✅ SUCCESS: Script mapping generated!")
        print("="*60)
        print("\n📋 Next Steps:")
        print("1. Open your Figma file")
        print("2. Install & run the 'Ad Script Importer' plugin (or create one)")
        print(f"3. Import this file: {output_path}")
        print("\nAlternatively:")
        print("- Manually copy scripts from the JSON file")
        print("- Use Figma Variables API (when available)")
        print("\n💡 Tip: Create a simple Figma plugin to automate this:")
        print("   https://www.figma.com/plugin-docs/")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
