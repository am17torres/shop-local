#!/usr/bin/env bash
#
# Deploy the partner-intake Apps Script as code (IaC) via clasp.
# Pushes apps-script/ (Code.gs + appsscript.json) to the BOUND script, then
# updates the EXISTING web-app deployment so the live /exec URL stays the same.
#
# Prereqs (one-time, desktop — see docs/PARTNER_INTAKE.md "Deploying as code"):
#   1. Enable the Apps Script API: https://script.google.com/home/usersettings
#   2. npx clasp login                          (browser OAuth -> ~/.clasprc.json)
#   3. cd apps-script && cp .clasp.json.example .clasp.json && fill in scriptId
#   4. export BH_APPSSCRIPT_DEPLOYMENT_ID=<the web-app deployment id>
#      (find it with: npx clasp deployments)
#
# After that, every release is just:  npm run appsscript:deploy
set -euo pipefail
cd "$(dirname "$0")"   # -> apps-script/ (holds .clasp.json, Code.gs, appsscript.json)

CLASP="npx --yes @google/clasp@2.4.2"   # pinned; not a project dep, keeps CI lean

[ -f .clasp.json ]      || { echo "ERROR: .clasp.json missing — cp .clasp.json.example .clasp.json and add the scriptId." >&2; exit 1; }
[ -f "$HOME/.clasprc.json" ] || { echo "ERROR: not logged in — run: npx clasp login" >&2; exit 1; }

echo "==> Pushing apps-script/ to the bound script…"
$CLASP push -f

if [ -z "${BH_APPSSCRIPT_DEPLOYMENT_ID:-}" ]; then
  echo
  echo "BH_APPSSCRIPT_DEPLOYMENT_ID is not set. Existing deployments:" >&2
  $CLASP deployments >&2
  echo >&2
  echo "Set it to the web-app deployment id (to keep the same /exec URL), then re-run:" >&2
  echo "  export BH_APPSSCRIPT_DEPLOYMENT_ID=AKfyc...   # the @HEAD one is the dev URL; pick the versioned web-app deployment" >&2
  exit 1
fi

echo "==> Updating deployment ${BH_APPSSCRIPT_DEPLOYMENT_ID} (same /exec URL)…"
$CLASP deploy -i "$BH_APPSSCRIPT_DEPLOYMENT_ID" -d "intake $(date -u +%Y-%m-%dT%H:%MZ)"
echo "==> Done. The live /exec endpoint now runs the latest Code.gs."
