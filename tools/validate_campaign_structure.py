"""
Validate Campaign Structure Tool
==================================

Pre-flight validation for campaign specs before pushing to Meta.

Purpose:
    Check a proposed campaign structure for correctness, completeness, and
    compliance with naming conventions, budget rules, and targeting specs.
    Acts as a safety gate before any entities are created in Meta Ads.

Inputs:
    --spec_file         Path to campaign spec JSON
    --brand             Brand ID (for validation context)
    --strict            Enable strict mode (fail on warnings too, default: false)

Outputs:
    JSON validation report with pass/fail status and list of issues

No MCP Integration:
    Pure Python validation. No external API calls.

Validation Checks:
    1. Budget allocation: daily budget within brand limits
    2. Naming conventions: all names match expected patterns
    3. Targeting specs: required fields present, valid values
    4. Lead form IDs: present and non-placeholder
    5. Creative references: image_hash or video_id present
    6. Status: all entities must be PAUSED
    7. Objective/optimisation alignment: compatible settings
"""

import argparse
import json
import logging
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"

VALID_OBJECTIVES = {
    "OUTCOME_LEADS",
    "OUTCOME_TRAFFIC",
    "OUTCOME_AWARENESS",
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_SALES",
    "OUTCOME_APP_PROMOTION",
}

VALID_OPTIMIZATION_GOALS = {
    "LEAD_GENERATION",
    "LINK_CLICKS",
    "IMPRESSIONS",
    "REACH",
    "LANDING_PAGE_VIEWS",
    "OFFSITE_CONVERSIONS",
}

VALID_BILLING_EVENTS = {"IMPRESSIONS", "LINK_CLICKS"}

# Objective-to-optimization alignment
OBJECTIVE_OPTIMIZATION_MAP: dict[str, set[str]] = {
    "OUTCOME_LEADS": {"LEAD_GENERATION", "LINK_CLICKS", "LANDING_PAGE_VIEWS"},
    "OUTCOME_TRAFFIC": {"LINK_CLICKS", "LANDING_PAGE_VIEWS", "IMPRESSIONS"},
    "OUTCOME_AWARENESS": {"REACH", "IMPRESSIONS"},
    "OUTCOME_ENGAGEMENT": {"IMPRESSIONS", "LINK_CLICKS"},
    "OUTCOME_SALES": {"OFFSITE_CONVERSIONS", "LINK_CLICKS"},
    "OUTCOME_APP_PROMOTION": {"LINK_CLICKS"},
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("validate_campaign_structure")


# ---------------------------------------------------------------------------
# Issue tracking
# ---------------------------------------------------------------------------

class ValidationIssue:
    """Represents a single validation issue."""

    def __init__(
        self,
        severity: str,
        category: str,
        entity: str,
        message: str,
        field: Optional[str] = None,
    ):
        self.severity = severity  # "error", "warning", "info"
        self.category = category
        self.entity = entity
        self.message = message
        self.field = field

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "severity": self.severity,
            "category": self.category,
            "entity": self.entity,
            "message": self.message,
        }
        if self.field:
            result["field"] = self.field
        return result


class ValidationReport:
    """Collects validation issues and produces a report."""

    def __init__(self):
        self.issues: list[ValidationIssue] = []

    def add_error(self, category: str, entity: str, message: str, field: Optional[str] = None) -> None:
        self.issues.append(ValidationIssue("error", category, entity, message, field))

    def add_warning(self, category: str, entity: str, message: str, field: Optional[str] = None) -> None:
        self.issues.append(ValidationIssue("warning", category, entity, message, field))

    def add_info(self, category: str, entity: str, message: str, field: Optional[str] = None) -> None:
        self.issues.append(ValidationIssue("info", category, entity, message, field))

    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "error")

    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "warning")

    @property
    def passed(self) -> bool:
        return self.error_count == 0

    def passed_strict(self) -> bool:
        return self.error_count == 0 and self.warning_count == 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "passed": self.passed,
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "info_count": sum(1 for i in self.issues if i.severity == "info"),
            "issues": [i.to_dict() for i in self.issues],
        }


# ---------------------------------------------------------------------------
# Config loading
# ---------------------------------------------------------------------------

def load_brand_config(brand_id: str) -> Optional[dict[str, Any]]:
    """Load brand config."""
    config_path = CONFIG_DIR / "brands.json"
    if not config_path.exists():
        return None

    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for brand in data.get("brands", []):
        if brand["brand_id"] == brand_id:
            return brand
    return None


# ---------------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------------

def validate_campaign(
    campaign: dict[str, Any],
    brand: Optional[dict[str, Any]],
    report: ValidationReport,
) -> None:
    """Validate campaign-level settings."""
    entity = campaign.get("name", "campaign")

    # Status must be PAUSED
    status = campaign.get("status", "")
    if status != "PAUSED":
        report.add_error(
            "safety", entity,
            f"Campaign status must be PAUSED, got '{status}'.",
            "status",
        )

    # Objective must be valid
    objective = campaign.get("objective", "")
    if objective not in VALID_OBJECTIVES:
        report.add_error(
            "objective", entity,
            f"Invalid objective '{objective}'. Valid: {sorted(VALID_OBJECTIVES)}",
            "objective",
        )

    # Budget validation
    daily_budget = campaign.get("daily_budget")
    if daily_budget is not None:
        budget_eur = float(daily_budget) / 100  # API uses cents

        if budget_eur <= 0:
            report.add_error("budget", entity, "Daily budget must be positive.", "daily_budget")

        if budget_eur < 1.0:
            report.add_error("budget", entity, "Minimum daily budget is 1.00 EUR.", "daily_budget")

        if brand:
            monthly_budget = brand.get("monthly_budget_eur", 0)
            projected = budget_eur * 30
            if monthly_budget > 0 and projected > monthly_budget:
                report.add_warning(
                    "budget", entity,
                    f"Projected monthly spend ({projected:.2f} EUR) exceeds "
                    f"brand budget ({monthly_budget:.2f} EUR).",
                    "daily_budget",
                )
    else:
        report.add_warning("budget", entity, "No daily_budget specified.", "daily_budget")

    # Name validation
    name = campaign.get("name", "")
    if not name:
        report.add_error("naming", entity, "Campaign name is empty.", "name")
    elif len(name) > 100:
        report.add_warning("naming", entity, f"Campaign name is {len(name)} chars (recommended max: 100).", "name")

    # Ad account ID
    ad_account = campaign.get("ad_account_id", "")
    if not ad_account or ad_account == "TO_BE_FILLED":
        report.add_error("config", entity, "ad_account_id is missing or placeholder.", "ad_account_id")


def validate_adset(
    adset: dict[str, Any],
    campaign_objective: str,
    brand: Optional[dict[str, Any]],
    report: ValidationReport,
) -> None:
    """Validate ad set-level settings."""
    entity = adset.get("name", "ad_set")

    # Status must be PAUSED
    status = adset.get("status", "")
    if status != "PAUSED":
        report.add_error("safety", entity, f"Ad set status must be PAUSED, got '{status}'.", "status")

    # Optimization goal validation
    opt_goal = adset.get("optimization_goal", "")
    if opt_goal not in VALID_OPTIMIZATION_GOALS:
        report.add_error(
            "optimization", entity,
            f"Invalid optimization_goal '{opt_goal}'. Valid: {sorted(VALID_OPTIMIZATION_GOALS)}",
            "optimization_goal",
        )

    # Objective-optimization alignment
    if campaign_objective and opt_goal:
        valid_goals = OBJECTIVE_OPTIMIZATION_MAP.get(campaign_objective, set())
        if valid_goals and opt_goal not in valid_goals:
            report.add_warning(
                "alignment", entity,
                f"optimization_goal '{opt_goal}' may not align with "
                f"campaign objective '{campaign_objective}'. "
                f"Recommended: {sorted(valid_goals)}",
                "optimization_goal",
            )

    # Billing event
    billing = adset.get("billing_event", "")
    if billing and billing not in VALID_BILLING_EVENTS:
        report.add_error(
            "billing", entity,
            f"Invalid billing_event '{billing}'. Valid: {sorted(VALID_BILLING_EVENTS)}",
            "billing_event",
        )

    # Targeting validation
    targeting = adset.get("targeting", {})
    if not targeting:
        report.add_error("targeting", entity, "No targeting spec provided.", "targeting")
    else:
        # Check geo_locations
        geo = targeting.get("geo_locations", {})
        if not geo:
            report.add_error("targeting", entity, "No geo_locations in targeting.", "targeting.geo_locations")
        else:
            countries = geo.get("countries", [])
            if not countries:
                report.add_warning("targeting", entity, "No countries specified in geo_locations.", "targeting.geo_locations.countries")

        # Check age range
        age_min = targeting.get("age_min")
        age_max = targeting.get("age_max")
        if age_min is not None and age_max is not None:
            if age_min < 18:
                report.add_error("targeting", entity, "age_min must be at least 18.", "targeting.age_min")
            if age_max > 65:
                report.add_info("targeting", entity, "age_max above 65 includes 65+ bucket.", "targeting.age_max")
            if age_min >= age_max:
                report.add_error("targeting", entity, "age_min must be less than age_max.", "targeting.age_min")

    # Lead form validation (if lead generation)
    if opt_goal == "LEAD_GENERATION":
        promoted = adset.get("promoted_object", {})
        lead_form = promoted.get("lead_gen_form_id", "")
        if not lead_form or lead_form == "TO_BE_FILLED":
            report.add_error(
                "lead_form", entity,
                "LEAD_GENERATION requires a valid lead_gen_form_id.",
                "promoted_object.lead_gen_form_id",
            )

        page_id = promoted.get("page_id", "")
        if not page_id or page_id == "TO_BE_FILLED":
            report.add_error(
                "config", entity,
                "promoted_object requires a valid page_id.",
                "promoted_object.page_id",
            )

    # Name validation
    name = adset.get("name", "")
    if not name:
        report.add_error("naming", entity, "Ad set name is empty.", "name")


def validate_ad(
    ad: dict[str, Any],
    report: ValidationReport,
) -> None:
    """Validate ad-level settings."""
    entity = ad.get("name", "ad")

    # Status must be PAUSED
    status = ad.get("status", "")
    if status != "PAUSED":
        report.add_error("safety", entity, f"Ad status must be PAUSED, got '{status}'.", "status")

    # Creative validation
    creative = ad.get("creative", {})
    if not creative:
        report.add_error("creative", entity, "No creative spec provided.", "creative")
    else:
        # Check for creative_id or object_story_spec
        if "creative_id" not in creative and "object_story_spec" not in creative:
            report.add_error(
                "creative", entity,
                "Creative must have 'creative_id' or 'object_story_spec'.",
                "creative",
            )

        story_spec = creative.get("object_story_spec", {})
        if story_spec:
            # Check page_id
            page_id = story_spec.get("page_id", "")
            if not page_id or page_id == "TO_BE_FILLED":
                report.add_error("creative", entity, "Creative requires a valid page_id.", "creative.object_story_spec.page_id")

            # Check for image or video data
            link_data = story_spec.get("link_data", {})
            video_data = story_spec.get("video_data", {})

            if not link_data and not video_data:
                report.add_error(
                    "creative", entity,
                    "Creative must have link_data (image) or video_data.",
                    "creative.object_story_spec",
                )

            if link_data and not link_data.get("image_hash"):
                report.add_error("creative", entity, "Image ad requires image_hash.", "creative.link_data.image_hash")

            if video_data and not video_data.get("video_id"):
                report.add_error("creative", entity, "Video ad requires video_id.", "creative.video_data.video_id")

    # Name validation
    name = ad.get("name", "")
    if not name:
        report.add_error("naming", entity, "Ad name is empty.", "name")

    # Adset ID
    adset_id = ad.get("adset_id", "")
    if not adset_id:
        report.add_error("config", entity, "adset_id is missing.", "adset_id")


# ---------------------------------------------------------------------------
# Naming convention validation
# ---------------------------------------------------------------------------

def validate_naming_conventions(
    spec: dict[str, Any],
    brand: Optional[dict[str, Any]],
    report: ValidationReport,
) -> None:
    """Validate that all entity names follow naming conventions."""
    brand_code = brand.get("brand_code", "") if brand else ""
    if not brand_code:
        report.add_info("naming", "all", "Cannot validate naming conventions without brand_code.")
        return

    campaign = spec.get("campaign", {})
    campaign_name = campaign.get("name", "")
    if campaign_name and not campaign_name.lower().startswith(brand_code.lower()):
        report.add_warning(
            "naming", campaign_name,
            f"Campaign name does not start with brand code '{brand_code}'.",
            "campaign.name",
        )

    for adset in spec.get("ad_sets", []):
        adset_name = adset.get("name", "")
        if adset_name and not adset_name.lower().startswith(brand_code.lower()):
            report.add_warning(
                "naming", adset_name,
                f"Ad set name does not start with brand code '{brand_code}'.",
                "ad_set.name",
            )

    for ad in spec.get("ads", []):
        ad_name = ad.get("name", "")
        if ad_name and not ad_name.lower().startswith(brand_code.lower()):
            report.add_warning(
                "naming", ad_name,
                f"Ad name does not start with brand code '{brand_code}'.",
                "ad.name",
            )


# ---------------------------------------------------------------------------
# Main validation pipeline
# ---------------------------------------------------------------------------

def validate_campaign_structure(
    spec_file: str,
    brand_id: str,
    strict: bool = False,
) -> dict[str, Any]:
    """
    Run the full validation pipeline on a campaign spec.

    Returns a structured validation report.
    """
    # Load spec
    spec_path = Path(spec_file)
    if not spec_path.exists():
        raise FileNotFoundError(f"Spec file not found: {spec_file}")

    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    # Load brand config
    brand = load_brand_config(brand_id)
    if not brand:
        logger.warning("Brand '%s' not found in config. Some validations skipped.", brand_id)

    report = ValidationReport()

    # Validate campaign
    campaign = spec.get("campaign", spec.get("request", {}).get("params", {}))
    campaign_objective = campaign.get("objective", "")
    if campaign:
        validate_campaign(campaign, brand, report)
    else:
        report.add_error("structure", "spec", "No campaign data found in spec.")

    # Validate ad sets
    ad_sets = spec.get("ad_sets", [])
    for adset in ad_sets:
        params = adset.get("params", adset)
        validate_adset(params, campaign_objective, brand, report)

    # Validate ads
    ads = spec.get("ads", [])
    for ad in ads:
        params = ad.get("params", ad)
        validate_ad(params, report)

    # Validate naming conventions
    validate_naming_conventions(spec, brand, report)

    # Determine overall pass/fail
    passed = report.passed_strict() if strict else report.passed

    output = {
        "metadata": {
            "tool": "validate_campaign_structure",
            "brand": brand_id,
            "spec_file": spec_file,
            "strict_mode": strict,
            "validated_at": datetime.utcnow().isoformat() + "Z",
        },
        "result": {
            "passed": passed,
            "status": "PASS" if passed else "FAIL",
            **report.to_dict(),
        },
    }

    return output


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate campaign structure before pushing to Meta.",
    )
    parser.add_argument("--spec_file", type=str, required=True, help="Path to campaign spec JSON")
    parser.add_argument("--brand", type=str, required=True, help="Brand ID")
    parser.add_argument(
        "--strict",
        action="store_true",
        default=False,
        help="Fail on warnings too (default: errors only)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> None:
    args = parse_args(argv)

    try:
        result = validate_campaign_structure(
            spec_file=args.spec_file,
            brand_id=args.brand,
            strict=args.strict,
        )

        print(json.dumps(result, indent=2))

        status = result["result"]["status"]
        errors = result["result"]["error_count"]
        warnings = result["result"]["warning_count"]

        if status == "PASS":
            logger.info("Validation PASSED (%d warnings).", warnings)
        else:
            logger.error("Validation FAILED: %d errors, %d warnings.", errors, warnings)
            sys.exit(1)

    except FileNotFoundError as exc:
        logger.error("Error: %s", exc)
        sys.exit(1)
    except Exception as exc:
        logger.exception("Unexpected error: %s", exc)
        sys.exit(2)


if __name__ == "__main__":
    main()
