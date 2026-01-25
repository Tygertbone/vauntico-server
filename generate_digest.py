import os
import subprocess
import json
import sys
from datetime import datetime

# Path to your repo
REPO_PATH = r"C:\Users\admin\vauntico-mvp"
OUTPUT_FILE = os.path.join(REPO_PATH, "daily_digest.md")

def get_repo_tree(path, depth=2):
    tree = []
    for root, dirs, files in os.walk(path):
        level = root.replace(path, "").count(os.sep)
        if level < depth:
            indent = " " * 2 * level
            tree.append(f"{indent}{os.path.basename(root)}/")
            subindent = " " * 2 * (level + 1)
            for f in files:
                # Skip hidden files and common non-source files
                if not f.startswith('.') and f not in ['node_modules', '.git', '__pycache__', 'dist', 'build']:
                    tree.append(f"{subindent}{f}")
    return "\n".join(tree)

def get_recent_commits(n=10):
    try:
        commits = subprocess.check_output(
            ["git", "-C", REPO_PATH, "log", "--oneline", f"-n{n}"],
            text=True
        )
        return commits.strip()
    except Exception as e:
        return f"Error fetching commits: {e}"

def get_github_issues():
    """Fetch GitHub issues for blockers using gh CLI"""
    try:
        # Get critical and high priority issues
        critical_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "20", "--state", "open", "--label", "critical", "--json", "number,title", "--jq", r'.[] | "#\(.number) \(.title) [CRITICAL]"'],
            text=True,
            cwd=REPO_PATH
        )
        
        high_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "15", "--state", "open", "--label", "high-priority", "--json", "number,title", "--jq", r'.[] | "#\(.number) \(.title) [HIGH]"'],
            text=True,
            cwd=REPO_PATH
        )
        
        ci_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "10", "--state", "open", "--label", "ci", "--json", "number,title", "--jq", r'.[] | "#\(.number) \(.title) [CI]"'],
            text=True,
            cwd=REPO_PATH
        )
        
        # Combine and format
        all_issues = []
        if critical_issues.strip():
            all_issues.extend(critical_issues.strip().split('\n'))
        if high_issues.strip():
            all_issues.extend(high_issues.strip().split('\n'))
        if ci_issues.strip():
            all_issues.extend(ci_issues.strip().split('\n'))
        
        # Format as bullet points, limit to 10
        formatted_blockers = []
        for issue in all_issues[:10]:
            formatted_blockers.append(f"- {issue}")
        
        if formatted_blockers:
            return "\n".join(formatted_blockers)
        else:
            return "- No critical blockers identified from GitHub issues"
            
    except Exception as e:
        print(f"Warning: Could not fetch GitHub issues: {e}")
        return "- Unable to fetch GitHub issues (gh CLI not available or authentication required)"

def get_workflow_failures():
    """Check for recent workflow failures"""
    try:
        failed_workflows = subprocess.check_output(
            ["gh", "run", "list", "--limit", "5", "--status", "failure", "--created", "24 hours ago", "--json", "name,conclusion,createdAt", "--jq", r'.[] | "- \(.name) (\(.createdAt))"'],
            text=True,
            cwd=REPO_PATH
        )
        
        if failed_workflows.strip():
            return failed_workflows.strip()
        else:
            return "- No workflow failures in last 24 hours"
            
    except Exception as e:
        print(f"Warning: Could not fetch workflow failures: {e}")
        return "- Unable to fetch workflow status (gh CLI not available or authentication required)"

def get_deployment_status():
    """Determine deployment status based on blockers and workflow failures"""
    # This is a simplified version - could be enhanced to check actual deployment endpoints
    try:
        critical_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "20", "--state", "open", "--label", "critical", "--json", "number", "--jq", 'length'],
            text=True,
            cwd=REPO_PATH
        )
        critical_count = int(critical_issues.strip() or "0")
        
        if critical_count > 5:
            return "⚠️ BLOCKED - Critical blockers prevent deployment"
        elif critical_count > 0:
            return "🟡 CAUTION - Minor blockers exist"
        else:
            return "✅ READY - No critical blockers identified"
            
    except:
        return "🔍 UNKNOWN - Unable to determine deployment status"

def get_dynamic_mission():
    """Adjust mission based on current blocker count"""
    try:
        critical_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "20", "--state", "open", "--label", "critical", "--json", "number", "--jq", 'length'],
            text=True,
            cwd=REPO_PATH
        )
        high_issues = subprocess.check_output(
            ["gh", "issue", "list", "--limit", "20", "--state", "open", "--label", "high-priority", "--json", "number", "--jq", 'length'],
            text=True,
            cwd=REPO_PATH
        )
        
        critical_count = int(critical_issues.strip() or "0")
        high_count = int(high_issues.strip() or "0")
        total_blockers = critical_count + high_count
        
        if total_blockers > 10:
            return "CRITICAL BLOCKER RESOLUTION - Address urgent issues before deployment"
        elif total_blockers > 5:
            return "Blocker cleanup and stabilization"
        else:
            return "Phase 2: Monetization (Months 4-6) - Activating Pro tier subscriptions ($49/month) and Trust Score Insurance add-on ($19/month) to achieve first $10K MRR milestone."
            
    except:
        return "Phase 2: Monetization (Months 4-6) - Activating Pro tier subscriptions ($49/month) and Trust Score Insurance add-on ($19/month) to achieve first $10K MRR milestone."

def main():
    # Parse command line arguments for depth
    depth = 2  # default
    if len(sys.argv) > 1:
        try:
            depth = int(sys.argv[1])
        except ValueError:
            print(f"Invalid depth argument: {sys.argv[1]}. Using default depth of 2.")
    
    # Also check for environment variable (for GitHub Actions)
    if 'DEPTH' in os.environ:
        try:
            depth = int(os.environ['DEPTH'])
        except ValueError:
            pass
    
    repo_tree = get_repo_tree(REPO_PATH, depth)
    commits = get_recent_commits()
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get dynamic content
    blockers = get_github_issues()
    workflow_failures = get_workflow_failures()
    deployment_status = get_deployment_status()
    current_mission = get_dynamic_mission()

    digest = f"""You are working inside the Vauntico codebase. Before you act, always keep this context in mind:

## 📅 Digest Date
{today}

## 📂 Repo Map (Depth: {depth})
{repo_tree}

## 🎯 Current Mission
{current_mission}

## 🚧 Known Blockers
{blockers}

## 🔧 CI/CD Status
{workflow_failures}

## 📝 Recent Changes
{commits}

## 🌐 Deployment Status
{deployment_status}

## 🔮 Vision Anchor
Vauntico is building "FICO score for creators" - AI-powered trust infrastructure solving the $104B creator economy's credibility crisis. 

Core Innovation: Portable trust scoring (0-100) measuring authenticity, consistency, and impact across platforms. Dual-personality architecture serving individual creators (viral free calculator → Pro tier) and enterprise clients (API licensing). Ubuntu philosophy ("I am because we are") creating emotional moat through sacred features.

Target: 2,847+ waitlist users, African market expansion, $1B ARR by Year 5.

---

When coding, always reason with this context first. Don't treat tasks as isolated snippets — connect them back to the repo's structure, current mission, blockers, and vision. If a request seems incomplete, ask for clarification using this context.
"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(digest)

    print(f"Digest generated at {OUTPUT_FILE} (depth: {depth})")

if __name__ == "__main__":
    main()