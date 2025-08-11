"""
Integration tests for the /pipelines/parse endpoint
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
import time
from main import app
from models import PipelineRequest, NodeData, EdgeData, Point

client = TestClient(app)


class TestPipelineParsing:
    """Test pipeline parsing endpoint functionality"""
    
    def test_valid_single_node_pipeline(self):
        """Test parsing a valid pipeline with a single node"""
        valid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {"value": "test"},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 1
        assert data["num_edges"] == 0
        assert data["is_dag"] == True
        assert data["validation_errors"] == []
        assert "processing_time_ms" in data
        assert isinstance(data["processing_time_ms"], (int, float))
        assert data["processing_time_ms"] >= 0
    
    def test_valid_pipeline_with_edges(self):
        """Test parsing a valid pipeline with nodes and edges"""
        valid_payload = {
            "nodes": [
                {
                    "id": "node1",
                    "type": "input",
                    "data": {"value": "test"},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "node2",
                    "type": "output",
                    "data": {},
                    "position": {"x": 100, "y": 0}
                }
            ],
            "edges": [{
                "id": "edge1",
                "source": "node1",
                "target": "node2",
                "sourceHandle": "out",
                "targetHandle": "in"
            }]
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 2
        assert data["num_edges"] == 1
        assert data["is_dag"] == True
        assert data["validation_errors"] == []
        assert "processing_time_ms" in data
    
    def test_complex_valid_dag(self):
        """Test parsing a complex valid DAG"""
        valid_payload = {
            "nodes": [
                {"id": "input1", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "input2", "type": "input", "data": {}, "position": {"x": 0, "y": 100}},
                {"id": "process1", "type": "transform", "data": {}, "position": {"x": 200, "y": 50}},
                {"id": "output1", "type": "output", "data": {}, "position": {"x": 400, "y": 50}}
            ],
            "edges": [
                {"id": "e1", "source": "input1", "target": "process1", "sourceHandle": "out", "targetHandle": "in1"},
                {"id": "e2", "source": "input2", "target": "process1", "sourceHandle": "out", "targetHandle": "in2"},
                {"id": "e3", "source": "process1", "target": "output1", "sourceHandle": "out", "targetHandle": "in"}
            ]
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 4
        assert data["num_edges"] == 3
        assert data["is_dag"] == True
        assert data["validation_errors"] == []
    
    def test_pipeline_with_cycle(self):
        """Test parsing a pipeline with a cycle"""
        cyclic_payload = {
            "nodes": [
                {"id": "node1", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "node2", "type": "process", "data": {}, "position": {"x": 100, "y": 0}},
                {"id": "node3", "type": "process", "data": {}, "position": {"x": 200, "y": 0}}
            ],
            "edges": [
                {"id": "e1", "source": "node1", "target": "node2", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e2", "source": "node2", "target": "node3", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e3", "source": "node3", "target": "node1", "sourceHandle": "out", "targetHandle": "in"}  # Creates cycle
            ]
        }
        
        response = client.post("/pipelines/parse", json=cyclic_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 3
        assert data["num_edges"] == 3
        assert data["is_dag"] == False
        assert len(data["validation_errors"]) > 0
        assert any("Cycle" in error for error in data["validation_errors"])
    
    def test_pipeline_with_self_loop(self):
        """Test parsing a pipeline with a self-loop"""
        self_loop_payload = {
            "nodes": [
                {"id": "node1", "type": "input", "data": {}, "position": {"x": 0, "y": 0}}
            ],
            "edges": [
                {"id": "e1", "source": "node1", "target": "node1", "sourceHandle": "out", "targetHandle": "in"}
            ]
        }
        
        # This should fail at the Pydantic validation level due to the model validator
        response = client.post("/pipelines/parse", json=self_loop_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
    
    def test_pipeline_with_duplicate_edges(self):
        """Test parsing a pipeline with duplicate edges"""
        duplicate_edges_payload = {
            "nodes": [
                {"id": "node1", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "node2", "type": "output", "data": {}, "position": {"x": 100, "y": 0}}
            ],
            "edges": [
                {"id": "e1", "source": "node1", "target": "node2", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e2", "source": "node1", "target": "node2", "sourceHandle": "out", "targetHandle": "in"}  # Duplicate
            ]
        }
        
        response = client.post("/pipelines/parse", json=duplicate_edges_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 2
        assert data["num_edges"] == 2
        assert len(data["validation_errors"]) > 0
        assert any("Duplicate edge" in error for error in data["validation_errors"])
    
    def test_empty_pipeline(self):
        """Test parsing an empty pipeline (should fail validation)"""
        empty_payload = {
            "nodes": [],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=empty_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
    
    def test_pipeline_with_metadata(self):
        """Test parsing a pipeline with metadata"""
        payload_with_metadata = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {"value": "test"},
                "position": {"x": 0, "y": 0}
            }],
            "edges": [],
            "metadata": {
                "version": "2.0.0",
                "created": "2024-01-01T00:00:00Z",
                "modified": "2024-01-01T00:00:00Z"
            }
        }
        
        response = client.post("/pipelines/parse", json=payload_with_metadata)
        assert response.status_code == 200
        
        data = response.json()
        assert data["num_nodes"] == 1
        assert data["num_edges"] == 0
        assert data["is_dag"] == True


class TestPipelineValidationErrors:
    """Test various validation error scenarios"""
    
    def test_missing_nodes_field(self):
        """Test error when nodes field is missing"""
        invalid_payload = {
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
        assert any("nodes" in detail.get("field", "") for detail in data["details"])
    
    def test_invalid_node_id(self):
        """Test error when node has invalid ID"""
        invalid_payload = {
            "nodes": [{
                "id": "",  # Empty ID
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
    
    def test_invalid_position_coordinates(self):
        """Test error when position coordinates are invalid"""
        invalid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": "invalid", "y": 0}  # Invalid x coordinate
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
    
    def test_edge_references_nonexistent_node(self):
        """Test error when edge references non-existent node"""
        invalid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": [{
                "id": "edge1",
                "source": "node1",
                "target": "nonexistent",  # Non-existent node
                "sourceHandle": "out",
                "targetHandle": "in"
            }]
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]
    
    def test_invalid_edge_handles(self):
        """Test error when edge has invalid handle IDs"""
        invalid_payload = {
            "nodes": [
                {"id": "node1", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "node2", "type": "output", "data": {}, "position": {"x": 100, "y": 0}}
            ],
            "edges": [{
                "id": "edge1",
                "source": "node1",
                "target": "node2",
                "sourceHandle": "",  # Empty handle ID
                "targetHandle": "in"
            }]
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Request validation failed" in data["error"]


class TestPipelinePerformance:
    """Test performance characteristics of the endpoint"""
    
    def test_large_pipeline_processing(self):
        """Test processing a large pipeline"""
        # Create a large but valid pipeline
        nodes = []
        edges = []
        
        # Create a chain of 100 nodes
        for i in range(100):
            nodes.append({
                "id": f"node_{i}",
                "type": "process",
                "data": {"index": i},
                "position": {"x": i * 50, "y": 0}
            })
            
            if i > 0:
                edges.append({
                    "id": f"edge_{i-1}_{i}",
                    "source": f"node_{i-1}",
                    "target": f"node_{i}",
                    "sourceHandle": "out",
                    "targetHandle": "in"
                })
        
        large_payload = {
            "nodes": nodes,
            "edges": edges
        }
        
        start_time = time.time()
        response = client.post("/pipelines/parse", json=large_payload)
        end_time = time.time()
        
        assert response.status_code == 200
        data = response.json()
        assert data["num_nodes"] == 100
        assert data["num_edges"] == 99
        assert data["is_dag"] == True
        
        # Verify processing time is reasonable (less than 5 seconds)
        processing_time = end_time - start_time
        assert processing_time < 5.0
        
        # Verify reported processing time is reasonable
        assert data["processing_time_ms"] < 5000
    
    def test_processing_time_accuracy(self):
        """Test that processing time is accurately reported"""
        simple_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=simple_payload)
        assert response.status_code == 200
        
        data = response.json()
        # Processing time should be non-negative and reasonable for a simple pipeline
        assert data["processing_time_ms"] >= 0
        assert data["processing_time_ms"] < 1000  # Should be less than 1 second


class TestErrorHandling:
    """Test error handling in the endpoint"""
    
    @patch('dag_analyzer.DAGAnalyzer')
    def test_dag_analyzer_exception_handling(self, mock_dag_analyzer_class):
        """Test handling of exceptions from DAGAnalyzer"""
        # Mock DAGAnalyzer to raise an exception
        mock_analyzer = MagicMock()
        mock_analyzer.build_graph.side_effect = ValueError("Test error")
        mock_dag_analyzer_class.return_value = mock_analyzer
        
        valid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 422
        data = response.json()
        assert "Pipeline validation failed" in data["error"]
        assert "Test error" in data["error"]
    
    @patch('dag_analyzer.DAGAnalyzer')
    def test_unexpected_exception_handling(self, mock_dag_analyzer_class):
        """Test handling of unexpected exceptions"""
        # Mock DAGAnalyzer to raise an unexpected exception
        mock_analyzer = MagicMock()
        mock_analyzer.build_graph.side_effect = RuntimeError("Unexpected error")
        mock_dag_analyzer_class.return_value = mock_analyzer
        
        valid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 500
        data = response.json()
        assert "An unexpected error occurred" in data["error"]
    
    def test_malformed_json(self):
        """Test handling of malformed JSON"""
        response = client.post(
            "/pipelines/parse",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_content_type_validation(self):
        """Test that endpoint requires JSON content type"""
        response = client.post(
            "/pipelines/parse",
            data="some data",
            headers={"Content-Type": "text/plain"}
        )
        assert response.status_code == 422


class TestResponseFormat:
    """Test response format consistency"""
    
    def test_success_response_format(self):
        """Test that success responses follow the expected format"""
        valid_payload = {
            "nodes": [{
                "id": "node1",
                "type": "input",
                "data": {},
                "position": {"x": 0, "y": 0}
            }],
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=valid_payload)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check all required fields are present
        required_fields = ["num_nodes", "num_edges", "is_dag", "validation_errors", "processing_time_ms"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check field types
        assert isinstance(data["num_nodes"], int)
        assert isinstance(data["num_edges"], int)
        assert isinstance(data["is_dag"], bool)
        assert isinstance(data["validation_errors"], list)
        assert isinstance(data["processing_time_ms"], (int, float))
    
    def test_error_response_format(self):
        """Test that error responses follow the expected format"""
        invalid_payload = {
            "nodes": [],  # Invalid: empty nodes list
            "edges": []
        }
        
        response = client.post("/pipelines/parse", json=invalid_payload)
        assert response.status_code == 422
        
        data = response.json()
        
        # Check error response format
        assert "error" in data
        assert "details" in data
        assert "timestamp" in data
        assert isinstance(data["details"], list)


class TestIntegrationWithDAGAnalyzer:
    """Test integration with DAGAnalyzer component"""
    
    def test_dag_analyzer_integration(self):
        """Test that DAGAnalyzer is properly integrated"""
        # Test a scenario that exercises DAGAnalyzer functionality
        complex_payload = {
            "nodes": [
                {"id": "a", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "b", "type": "process", "data": {}, "position": {"x": 100, "y": 0}},
                {"id": "c", "type": "process", "data": {}, "position": {"x": 200, "y": 0}},
                {"id": "d", "type": "output", "data": {}, "position": {"x": 300, "y": 0}}
            ],
            "edges": [
                {"id": "e1", "source": "a", "target": "b", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e2", "source": "b", "target": "c", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e3", "source": "c", "target": "d", "sourceHandle": "out", "targetHandle": "in"}
            ]
        }
        
        response = client.post("/pipelines/parse", json=complex_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_dag"] == True
        assert data["validation_errors"] == []
    
    def test_cycle_detection_integration(self):
        """Test that cycle detection works through the endpoint"""
        cyclic_payload = {
            "nodes": [
                {"id": "a", "type": "input", "data": {}, "position": {"x": 0, "y": 0}},
                {"id": "b", "type": "process", "data": {}, "position": {"x": 100, "y": 0}},
                {"id": "c", "type": "output", "data": {}, "position": {"x": 200, "y": 0}}
            ],
            "edges": [
                {"id": "e1", "source": "a", "target": "b", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e2", "source": "b", "target": "c", "sourceHandle": "out", "targetHandle": "in"},
                {"id": "e3", "source": "c", "target": "a", "sourceHandle": "out", "targetHandle": "in"}  # Creates cycle
            ]
        }
        
        response = client.post("/pipelines/parse", json=cyclic_payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_dag"] == False
        assert len(data["validation_errors"]) > 0
        assert any("Cycle" in error for error in data["validation_errors"])