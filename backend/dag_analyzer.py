"""
DAG Analysis Engine for Node Pipeline System

This module implements graph analysis functionality to validate pipeline structures,
detect cycles, and perform topological sorting using Kahn's algorithm.
"""

from typing import Dict, List, Set, Tuple, Optional
from collections import defaultdict, deque
import logging
from models import EdgeData

logger = logging.getLogger(__name__)


class DAGAnalyzer:
    """
    Directed Acyclic Graph analyzer for pipeline validation.
    
    Uses Kahn's algorithm for topological sorting and cycle detection.
    Builds adjacency list representation from edge data for efficient analysis.
    """
    
    def __init__(self):
        """Initialize the DAG analyzer with empty graph structures."""
        self.adjacency_list: Dict[str, List[str]] = defaultdict(list)
        self.in_degree: Dict[str, int] = defaultdict(int)
        self.nodes: Set[str] = set()
        self.edges: List[EdgeData] = []
    
    def build_graph(self, edges: List[EdgeData], node_ids: Optional[Set[str]] = None) -> None:
        """
        Build adjacency list representation from edge data.
        
        Args:
            edges: List of edge data containing source and target node connections
            node_ids: Optional set of valid node IDs for validation
            
        Raises:
            ValueError: If edges reference non-existent nodes (when node_ids provided)
        """
        # Reset graph structures
        self.adjacency_list.clear()
        self.in_degree.clear()
        self.nodes.clear()
        self.edges = edges.copy()
        
        # Validate edges reference existing nodes if node_ids provided
        if node_ids is not None:
            for edge in edges:
                if edge.source not in node_ids:
                    raise ValueError(f"Edge source '{edge.source}' references non-existent node")
                if edge.target not in node_ids:
                    raise ValueError(f"Edge target '{edge.target}' references non-existent node")
        
        # Build adjacency list and collect all nodes
        for edge in edges:
            self.adjacency_list[edge.source].append(edge.target)
            self.nodes.add(edge.source)
            self.nodes.add(edge.target)
        
        # Initialize in-degree for all nodes
        for node in self.nodes:
            self.in_degree[node] = 0
        
        # Calculate in-degrees
        for edge in edges:
            self.in_degree[edge.target] += 1
        
        logger.debug(f"Built graph with {len(self.nodes)} nodes and {len(edges)} edges")
    
    def is_dag(self) -> bool:
        """
        Determine if the graph is a Directed Acyclic Graph using Kahn's algorithm.
        
        Returns:
            bool: True if the graph is a DAG (no cycles), False otherwise
        """
        if not self.nodes:
            return True  # Empty graph is a DAG
        
        # Create working copy of in-degrees
        working_in_degree = self.in_degree.copy()
        
        # Initialize queue with nodes that have no incoming edges
        queue = deque([node for node in self.nodes if working_in_degree[node] == 0])
        processed_count = 0
        
        # Process nodes in topological order
        while queue:
            current_node = queue.popleft()
            processed_count += 1
            
            # Remove edges from current node and update in-degrees
            for neighbor in self.adjacency_list[current_node]:
                working_in_degree[neighbor] -= 1
                if working_in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # If all nodes were processed, the graph is a DAG
        is_dag_result = processed_count == len(self.nodes)
        
        logger.debug(f"DAG analysis: processed {processed_count}/{len(self.nodes)} nodes, is_dag={is_dag_result}")
        return is_dag_result
    
    def detect_cycles(self) -> List[List[str]]:
        """
        Detect and return all cycles in the graph using DFS.
        
        Returns:
            List[List[str]]: List of cycles, where each cycle is a list of node IDs
        """
        if not self.nodes:
            return []
        
        # Track node states: 0=unvisited, 1=visiting, 2=visited
        state = {node: 0 for node in self.nodes}
        cycles = []
        current_path = []
        path_set = set()
        
        def dfs(node: str) -> None:
            """Depth-first search to detect cycles."""
            if state[node] == 1:  # Back edge found - cycle detected
                # Find the cycle in current path
                cycle_start_idx = current_path.index(node)
                cycle = current_path[cycle_start_idx:] + [node]
                cycles.append(cycle)
                return
            
            if state[node] == 2:  # Already fully processed
                return
            
            # Mark as visiting and add to path
            state[node] = 1
            current_path.append(node)
            path_set.add(node)
            
            # Visit all neighbors
            for neighbor in self.adjacency_list[node]:
                dfs(neighbor)
            
            # Mark as visited and remove from path
            state[node] = 2
            current_path.pop()
            path_set.remove(node)
        
        # Start DFS from all unvisited nodes
        for node in self.nodes:
            if state[node] == 0:
                dfs(node)
        
        logger.debug(f"Cycle detection found {len(cycles)} cycles")
        return cycles
    
    def get_topological_order(self) -> Optional[List[str]]:
        """
        Get topological ordering of nodes if the graph is a DAG.
        
        Returns:
            Optional[List[str]]: Topologically sorted list of node IDs, or None if graph has cycles
        """
        if not self.is_dag():
            return None
        
        # Create working copy of in-degrees
        working_in_degree = self.in_degree.copy()
        
        # Initialize queue with nodes that have no incoming edges
        queue = deque([node for node in self.nodes if working_in_degree[node] == 0])
        topological_order = []
        
        # Process nodes in topological order
        while queue:
            current_node = queue.popleft()
            topological_order.append(current_node)
            
            # Remove edges from current node and update in-degrees
            for neighbor in self.adjacency_list[current_node]:
                working_in_degree[neighbor] -= 1
                if working_in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        logger.debug(f"Generated topological order: {topological_order}")
        return topological_order
    
    def get_graph_stats(self) -> Dict[str, int]:
        """
        Get basic statistics about the graph.
        
        Returns:
            Dict[str, int]: Dictionary containing node count, edge count, and other metrics
        """
        return {
            "node_count": len(self.nodes),
            "edge_count": len(self.edges),
            "max_in_degree": max(self.in_degree.values()) if self.in_degree else 0,
            "max_out_degree": max(len(neighbors) for neighbors in self.adjacency_list.values()) if self.adjacency_list else 0,
            "isolated_nodes": len([node for node in self.nodes if self.in_degree[node] == 0 and len(self.adjacency_list[node]) == 0])
        }
    
    def validate_graph_structure(self) -> Tuple[bool, List[str]]:
        """
        Validate the overall graph structure and return validation results.
        
        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_validation_errors)
        """
        errors = []
        
        # Check for self-loops
        for edge in self.edges:
            if edge.source == edge.target:
                errors.append(f"Self-loop detected: node '{edge.source}' connects to itself")
        
        # Check for duplicate edges
        edge_set = set()
        for edge in self.edges:
            edge_key = (edge.source, edge.target, edge.sourceHandle, edge.targetHandle)
            if edge_key in edge_set:
                errors.append(f"Duplicate edge detected: {edge.source} -> {edge.target}")
            edge_set.add(edge_key)
        
        # Check for cycles
        if not self.is_dag():
            cycles = self.detect_cycles()
            for i, cycle in enumerate(cycles):
                cycle_str = " -> ".join(cycle)
                errors.append(f"Cycle {i+1} detected: {cycle_str}")
        
        is_valid = len(errors) == 0
        logger.debug(f"Graph validation: is_valid={is_valid}, errors={len(errors)}")
        
        return is_valid, errors