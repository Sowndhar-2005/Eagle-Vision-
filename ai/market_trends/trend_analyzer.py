"""
Eagle Vision — Market Trends & Industry Skill Demands Analyzer
"""

from typing import Dict, List


class MarketTrendsAnalyzer:
    """Analyzes market demand, emerging skill clusters, and sunsetting technologies."""

    @staticmethod
    def get_benchmark_trends() -> Dict[str, List[Dict]]:
        return {
            "emerging": [
                {"skill": "Generative AI Engineering", "growth_rate": "+180%", "priority": "high"},
                {"skill": "MLOps & LLMOps", "growth_rate": "+140%", "priority": "high"},
                {"skill": "Cloud FinOps", "growth_rate": "+95%", "priority": "medium"},
                {"skill": "Rust Systems Programming", "growth_rate": "+75%", "priority": "medium"},
            ],
            "declining": [
                {"skill": "Monolithic Architecture Maintenance", "growth_rate": "-45%"},
                {"skill": "Manual QA / Scripting", "growth_rate": "-35%"},
            ],
        }
