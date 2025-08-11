"""
Unit tests for DAG Analysis Engine

Tests cover graph building, cycle detection, topological sorting,
and various edge cases for the DAGAnalyzer class.
"""

import pytest
from typing import List
from dag_analyzer import DAGAnalyzer
from models import EdgeData


class TestDAGAnalyzer:
    """Test suite for DAGAnalyzer class."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.analyzer = DAGAnalyzer()
    
    def create_edge(self, source: str, target: str, source_handle: str = "out", target_handle: str = "in") -> EdgeData:
        """Helper method to create EdgeData objects."""
        return EdgeData(
            id=f"{source}-{target}",
            source=source,
            target=target,
            sourceHandle=source_handle,
            targetHandle=target_handle
        )
    
    def test_empty_graph(self):
        """Test behavior with empty graph."""
        self.analyzer.build_graph([])
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        assert self.analyzer.get_topological_order() == []
        assert self.analyzer.get_graph_stats()["node_count"] == 0
        assert self.analyzer.get_graph_stats()["edge_count"] == 0
    
    def test_single_node_no_edges(self):
        """Test graph with single isolated node."""
        # Single node with no edges - need to provide node_ids
        node_ids = {"A"}
        self.analyzer.build_graph([], node_ids)
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        assert self.analyzer.get_topological_order() == []
        stats = self.analyzer.get_graph_stats()
        assert stats["node_count"] == 0  # No nodes added without edges
        assert stats["edge_count"] == 0
    
    def test_simple_dag(self):
        """Test simple directed acyclic graph: A -> B -> C."""
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "C")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        
        topo_order = self.analyzer.get_topological_order()
        assert topo_order is not None
        assert len(topo_order) == 3
        assert topo_order.index("A") < topo_order.index("B")
        assert topo_order.index("B") < topo_order.index("C")
        
        stats = self.analyzer.get_graph_stats()
        assert stats["node_count"] == 3
        assert stats["edge_count"] == 2
        assert stats["max_in_degree"] == 1
        assert stats["max_out_degree"] == 1
    
    def test_diamond_dag(self):
        """Test diamond-shaped DAG: A -> B,C -> D."""
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("A", "C"),
            self.create_edge("B", "D"),
            self.create_edge("C", "D")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        
        topo_order = self.analyzer.get_topological_order()
        assert topo_order is not None
        assert len(topo_order) == 4
        assert topo_order.index("A") < topo_order.index("B")
        assert topo_order.index("A") < topo_order.index("C")
        assert topo_order.index("B") < topo_order.index("D")
        assert topo_order.index("C") < topo_order.index("D")
        
        stats = self.analyzer.get_graph_stats()
        assert stats["node_count"] == 4
        assert stats["edge_count"] == 4
        assert stats["max_in_degree"] == 2  # Node D has 2 incoming edges
        assert stats["max_out_degree"] == 2  # Node A has 2 outgoing edges
    
    def test_simple_cycle(self):
        """Test simple cycle: A -> B -> A."""
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "A")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 1
        # Should detect cycle containing A and B
        cycle_nodes = set()
        for cycle in cycles:
            cycle_nodes.update(cycle)
        assert "A" in cycle_nodes
        assert "B" in cycle_nodes
        
        assert self.analyzer.get_topological_order() is None
    
    def test_self_loop(self):
        """Test self-loop: A -> A."""
        # Create a mock edge object for self-loop testing
        class MockEdge:
            def __init__(self, id, source, target, sourceHandle, targetHandle):
                self.id = id
                self.source = source
                self.target = target
                self.sourceHandle = sourceHandle
                self.targetHandle = targetHandle
        
        edge = MockEdge("A-A", "A", "A", "out", "in")
        edges = [edge]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 1
        # Should detect self-loop
        found_self_loop = any("A" in cycle for cycle in cycles)
        assert found_self_loop
        
        assert self.analyzer.get_topological_order() is None
    
    def test_complex_cycle(self):
        """Test complex cycle: A -> B -> C -> D -> B."""
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "C"),
            self.create_edge("C", "D"),
            self.create_edge("D", "B")  # Creates cycle B -> C -> D -> B
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 1
        # Should detect cycle containing B, C, D
        cycle_nodes = set()
        for cycle in cycles:
            cycle_nodes.update(cycle)
        assert "B" in cycle_nodes
        assert "C" in cycle_nodes
        assert "D" in cycle_nodes
        
        assert self.analyzer.get_topological_order() is None
    
    def test_multiple_cycles(self):
        """Test graph with multiple independent cycles."""
        edges = [
            # First cycle: A -> B -> A
            self.create_edge("A", "B"),
            self.create_edge("B", "A"),
            # Second cycle: C -> D -> C
            self.create_edge("C", "D"),
            self.create_edge("D", "C")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 2
        
        # Collect all nodes involved in cycles
        cycle_nodes = set()
        for cycle in cycles:
            cycle_nodes.update(cycle)
        
        # Should detect both cycles
        assert "A" in cycle_nodes
        assert "B" in cycle_nodes
        assert "C" in cycle_nodes
        assert "D" in cycle_nodes
        
        assert self.analyzer.get_topological_order() is None
    
    def test_disconnected_components_dag(self):
        """Test DAG with disconnected components."""
        edges = [
            # Component 1: A -> B
            self.create_edge("A", "B"),
            # Component 2: C -> D -> E
            self.create_edge("C", "D"),
            self.create_edge("D", "E")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        
        topo_order = self.analyzer.get_topological_order()
        assert topo_order is not None
        assert len(topo_order) == 5
        
        # Verify ordering within components
        assert topo_order.index("A") < topo_order.index("B")
        assert topo_order.index("C") < topo_order.index("D")
        assert topo_order.index("D") < topo_order.index("E")
        
        stats = self.analyzer.get_graph_stats()
        assert stats["node_count"] == 5
        assert stats["edge_count"] == 3
    
    def test_disconnected_components_with_cycle(self):
        """Test graph with one DAG component and one cyclic component."""
        edges = [
            # DAG component: A -> B -> C
            self.create_edge("A", "B"),
            self.create_edge("B", "C"),
            # Cyclic component: D -> E -> D
            self.create_edge("D", "E"),
            self.create_edge("E", "D")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 1
        
        # Should detect cycle in D-E component
        cycle_nodes = set()
        for cycle in cycles:
            cycle_nodes.update(cycle)
        assert "D" in cycle_nodes
        assert "E" in cycle_nodes
        
        assert self.analyzer.get_topological_order() is None
    
    def test_large_dag(self):
        """Test performance with larger DAG."""
        # Create a chain: 0 -> 1 -> 2 -> ... -> 99
        edges = []
        for i in range(99):
            edges.append(self.create_edge(str(i), str(i + 1)))
        
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is True
        assert self.analyzer.detect_cycles() == []
        
        topo_order = self.analyzer.get_topological_order()
        assert topo_order is not None
        assert len(topo_order) == 100
        
        # Verify correct ordering
        for i in range(99):
            assert topo_order.index(str(i)) < topo_order.index(str(i + 1))
        
        stats = self.analyzer.get_graph_stats()
        assert stats["node_count"] == 100
        assert stats["edge_count"] == 99
        assert stats["max_in_degree"] == 1
        assert stats["max_out_degree"] == 1
    
    def test_build_graph_with_node_validation(self):
        """Test graph building with node ID validation."""
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "C")
        ]
        
        # Valid node IDs
        valid_node_ids = {"A", "B", "C"}
        self.analyzer.build_graph(edges, valid_node_ids)
        assert self.analyzer.is_dag() is True
        
        # Invalid node IDs - missing node C
        invalid_node_ids = {"A", "B"}
        with pytest.raises(ValueError, match="references non-existent node"):
            self.analyzer.build_graph(edges, invalid_node_ids)
    
    def test_graph_validation(self):
        """Test comprehensive graph structure validation."""
        # Valid DAG
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "C")
        ]
        self.analyzer.build_graph(edges)
        is_valid, errors = self.analyzer.validate_graph_structure()
        assert is_valid is True
        assert len(errors) == 0
        
        # Graph with self-loop
        # Create a mock edge object for self-loop testing
        class MockEdge:
            def __init__(self, id, source, target, sourceHandle, targetHandle):
                self.id = id
                self.source = source
                self.target = target
                self.sourceHandle = sourceHandle
                self.targetHandle = targetHandle
        
        edge_self_loop = MockEdge("B-B", "B", "B", "out", "in")
        
        edges_with_self_loop = [
            self.create_edge("A", "B"),
            edge_self_loop  # Self-loop
        ]
        self.analyzer.build_graph(edges_with_self_loop)
        is_valid, errors = self.analyzer.validate_graph_structure()
        assert is_valid is False
        assert any("Self-loop" in error for error in errors)
        
        # Graph with cycle
        edges_with_cycle = [
            self.create_edge("A", "B"),
            self.create_edge("B", "A")  # Cycle
        ]
        self.analyzer.build_graph(edges_with_cycle)
        is_valid, errors = self.analyzer.validate_graph_structure()
        assert is_valid is False
        assert any("Cycle" in error for error in errors)
        
        # Graph with duplicate edges
        edges_with_duplicates = [
            self.create_edge("A", "B"),
            self.create_edge("A", "B")  # Duplicate
        ]
        self.analyzer.build_graph(edges_with_duplicates)
        is_valid, errors = self.analyzer.validate_graph_structure()
        assert is_valid is False
        assert any("Duplicate edge" in error for error in errors)
    
    def test_edge_cases(self):
        """Test various edge cases and boundary conditions."""
        # Graph with only one edge
        edges = [self.create_edge("A", "B")]
        self.analyzer.build_graph(edges)
        assert self.analyzer.is_dag() is True
        assert len(self.analyzer.get_topological_order()) == 2
        
        # Graph with high fan-out (one node connects to many)
        edges = []
        for i in range(10):
            edges.append(self.create_edge("root", f"child_{i}"))
        
        self.analyzer.build_graph(edges)
        assert self.analyzer.is_dag() is True
        
        stats = self.analyzer.get_graph_stats()
        assert stats["max_out_degree"] == 10
        assert stats["max_in_degree"] == 1
        
        # Graph with high fan-in (many nodes connect to one)
        edges = []
        for i in range(10):
            edges.append(self.create_edge(f"parent_{i}", "sink"))
        
        self.analyzer.build_graph(edges)
        assert self.analyzer.is_dag() is True
        
        stats = self.analyzer.get_graph_stats()
        assert stats["max_out_degree"] == 1
        assert stats["max_in_degree"] == 10
    
    def test_kahn_algorithm_correctness(self):
        """Test that Kahn's algorithm produces correct topological ordering."""
        # Create a more complex DAG to test ordering
        edges = [
            self.create_edge("A", "D"),
            self.create_edge("B", "D"),
            self.create_edge("C", "E"),
            self.create_edge("D", "F"),
            self.create_edge("E", "F"),
            self.create_edge("F", "G")
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is True
        
        topo_order = self.analyzer.get_topological_order()
        assert topo_order is not None
        assert len(topo_order) == 7
        
        # Verify all ordering constraints are satisfied
        assert topo_order.index("A") < topo_order.index("D")
        assert topo_order.index("B") < topo_order.index("D")
        assert topo_order.index("C") < topo_order.index("E")
        assert topo_order.index("D") < topo_order.index("F")
        assert topo_order.index("E") < topo_order.index("F")
        assert topo_order.index("F") < topo_order.index("G")
    
    def test_cycle_detection_accuracy(self):
        """Test that cycle detection finds all cycles accurately."""
        # Create graph with known cycle structure
        edges = [
            self.create_edge("A", "B"),
            self.create_edge("B", "C"),
            self.create_edge("C", "A"),  # Cycle: A -> B -> C -> A
            self.create_edge("D", "E"),  # Separate component (no cycle)
        ]
        self.analyzer.build_graph(edges)
        
        assert self.analyzer.is_dag() is False
        
        cycles = self.analyzer.detect_cycles()
        assert len(cycles) >= 1
        
        # Verify the cycle contains the expected nodes
        cycle_found = False
        for cycle in cycles:
            cycle_set = set(cycle[:-1])  # Remove duplicate last node
            if cycle_set == {"A", "B", "C"}:
                cycle_found = True
                break
        
        assert cycle_found, f"Expected cycle A-B-C not found in {cycles}"