"""
Command Line Interface for Resume Analysis Agent.
"""

import argparse
import json
import os
import sys
from pathlib import Path

from resume_analysis_agent.agent import ResumeAnalysisAgent
from resume_analysis_agent.core.config import settings

# Fix Windows console UTF-8 encoding
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(
        prog="resume-agent",
        description="Autonomous Resume-to-Score AI evaluation agent with fairness guardrails.",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: analyze
    analyze_parser = subparsers.add_parser("analyze", help="Evaluate a resume PDF or text file")
    analyze_parser.add_argument("file", type=str, help="Path to resume file (PDF, TXT, MD)")
    analyze_parser.add_argument(
        "--role",
        type=str,
        default="software_engineering_intern",
        help="Role rubric to score against (default: software_engineering_intern)",
    )
    analyze_parser.add_argument(
        "--no-github",
        action="store_true",
        help="Skip GitHub developer signal enrichment",
    )
    analyze_parser.add_argument(
        "--format",
        choices=["text", "markdown", "json"],
        default="markdown",
        help="Output format (default: markdown)",
    )
    analyze_parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Optional file path to save the output report",
    )

    # Command: list-roles
    subparsers.add_parser("list-roles", help="List all available evaluation role rubrics")

    # Command: serve
    serve_parser = subparsers.add_parser("serve", help="Launch the REST API microservice")
    serve_parser.add_argument("--host", type=str, default=settings.AGENT_HOST, help="Host address")
    serve_parser.add_argument("--port", type=int, default=settings.AGENT_PORT, help="Port number")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    agent = ResumeAnalysisAgent()

    if args.command == "list-roles":
        roles = agent.list_roles()
        print("\n📋 Available Role Rubrics:")
        for r in roles:
            print(f"  • {r}")
        print()
        return

    elif args.command == "serve":
        import uvicorn
        print(f"\n🚀 Launching Resume Analysis Agent REST API on http://{args.host}:{args.port}")
        uvicorn.run("resume_analysis_agent.api:app", host=args.host, port=args.port, reload=True)
        return

    elif args.command == "analyze":
        file_path = Path(args.file)
        if not file_path.is_file():
            print(f"❌ Error: File '{file_path}' does not exist.", file=sys.stderr)
            sys.exit(1)

        print(f"🔍 Analyzing resume '{file_path.name}' against role '{args.role}'...\n")
        report = agent.analyze(
            input_source=file_path,
            role=args.role,
            enrich_github=not args.no_github,
            filename=file_path.name,
        )

        output_text = ""
        if args.format == "json":
            output_text = report.model_dump_json(indent=2)
        elif args.format == "markdown" or args.format == "text":
            output_text = agent.format_report_markdown(report)

        print(output_text)

        if args.output:
            out_path = Path(args.output)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(output_text)
            print(f"\n✅ Report successfully saved to: {out_path.resolve()}")


if __name__ == "__main__":
    main()
