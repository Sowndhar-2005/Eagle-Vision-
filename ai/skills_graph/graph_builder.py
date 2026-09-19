"""
Eagle Vision — AI Skills Knowledge Graph Builder
"""

from typing import Dict, List, Set
import networkx as nx


class SkillsGraphBuilder:
    """Constructs and queries the skills adjacency & transferability ontology."""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_skill(self, skill_id: str, name: str, category: str):
        self.graph.add_node(skill_id, name=name, category=category)

    def add_relationship(
        self, source_id: str, target_id: str, relationship_type: str, weight: float = 1.0
    ):
        self.graph.add_edge(
            source_id, target_id, type=relationship_type, weight=weight
        )

    def find_transferable_skills(self, skill_id: str, cutoff_depth: int = 2) -> List[Dict]:
        """Traverse graph to find adjacent transferable skills within cutoff distance."""
        if skill_id not in self.graph:
            return []

        neighbors = nx.single_source_shortest_path_length(
            self.graph, skill_id, cutoff=cutoff_depth
        )
        results = []
        for nid, dist in neighbors.items():
            if nid != skill_id:
                node_data = self.graph.nodes[nid]
                results.append(
                    {
                        "skill_id": nid,
                        "name": node_data.get("name"),
                        "category": node_data.get("category"),
                        "distance": dist,
                        "transferability_score": round(1.0 / dist, 2),
                    }
                )
        return sorted(results, key=lambda x: x["transferability_score"], reverse=True)
