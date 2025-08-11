"""
Tests for Pydantic models and validation
"""

import pytest
from pydantic import ValidationError
from models import (
    Point, Dimensions, SizeConstraints, HandleDefinition,
    NodeData, EdgeData, PipelineRequest, PipelineResponse,
    VariableMatch, ValidationResult
)


class TestPoint:
    def test_valid_point(self):
        point = Point(x=10.5, y=20.3)
        assert point.x == 10.5
        assert point.y == 20.3

    def test_point_with_integers(self):
        point = Point(x=10, y=20)
        assert point.x == 10.0
        assert point.y == 20.0


class TestDimensions:
    def test_valid_dimensions(self):
        dims = Dimensions(width=100, height=50)
        assert dims.width == 100
        assert dims.height == 50

    def test_zero_dimensions_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            Dimensions(width=0, height=50)
        assert "Input should be greater than 0" in str(exc_info.value)

    def test_negative_dimensions_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            Dimensions(width=100, height=-10)
        assert "Input should be greater than 0" in str(exc_info.value)


class TestSizeConstraints:
    def test_valid_constraints(self):
        constraints = SizeConstraints(
            minWidth=10, maxWidth=100,
            minHeight=20, maxHeight=200,
            padding=5
        )
        assert constraints.minWidth == 10
        assert constraints.maxWidth == 100

    def test_max_width_less_than_min_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            SizeConstraints(
                minWidth=100, maxWidth=50,
                minHeight=20, maxHeight=200,
                padding=5
            )
        assert "maxWidth must be greater than minWidth" in str(exc_info.value)

    def test_max_height_less_than_min_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            SizeConstraints(
                minWidth=10, maxWidth=100,
                minHeight=200, maxHeight=50,
                padding=5
            )
        assert "maxHeight must be greater than minHeight" in str(exc_info.value)


class TestHandleDefinition:
    def test_valid_handle(self):
        handle = HandleDefinition(
            id="handle1",
            name="Input",
            dataType="string",
            optional=False,
            position="left"
        )
        assert handle.id == "handle1"
        assert handle.position == "left"

    def test_invalid_position(self):
        with pytest.raises(ValidationError):
            HandleDefinition(
                id="handle1",
                name="Input",
                dataType="string",
                position="invalid"  # type: ignore
            )


class TestNodeData:
    def test_valid_node(self):
        node = NodeData(
            id="node1",
            type="input",
            data={"value": "test"},
            position=Point(x=10, y=20)
        )
        assert node.id == "node1"
        assert node.type == "input"
        assert node.data["value"] == "test"

    def test_empty_id_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            NodeData(
                id="",
                type="input",
                data={},
                position=Point(x=10, y=20)
            )
        assert "at least 1 character" in str(exc_info.value)


class TestEdgeData:
    def test_valid_edge(self):
        edge = EdgeData(
            id="edge1",
            source="node1",
            target="node2",
            sourceHandle="out",
            targetHandle="in"
        )
        assert edge.id == "edge1"
        assert edge.source == "node1"
        assert edge.target == "node2"

    def test_self_referencing_edge_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            EdgeData(
                id="edge1",
                source="node1",
                target="node1",
                sourceHandle="out",
                targetHandle="in"
            )
        assert "target cannot be the same as source" in str(exc_info.value)


class TestPipelineRequest:
    def test_valid_pipeline(self):
        pipeline = PipelineRequest(
            nodes=[
                NodeData(
                    id="node1",
                    type="input",
                    data={},
                    position=Point(x=0, y=0)
                )
            ],
            edges=[]
        )
        assert len(pipeline.nodes) == 1
        assert len(pipeline.edges) == 0

    def test_empty_nodes_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            PipelineRequest(nodes=[], edges=[])
        assert "at least 1 item" in str(exc_info.value)

    def test_edge_referencing_nonexistent_node_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            PipelineRequest(
                nodes=[
                    NodeData(
                        id="node1",
                        type="input",
                        data={},
                        position=Point(x=0, y=0)
                    )
                ],
                edges=[
                    EdgeData(
                        id="edge1",
                        source="node1",
                        target="nonexistent",
                        sourceHandle="out",
                        targetHandle="in"
                    )
                ]
            )
        assert "references non-existent node" in str(exc_info.value)


class TestVariableMatch:
    def test_valid_variable_match(self):
        match = VariableMatch(
            name="variable1",
            startIndex=0,
            endIndex=10,
            isValid=True
        )
        assert match.name == "variable1"
        assert match.startIndex == 0
        assert match.endIndex == 10

    def test_end_index_less_than_start_invalid(self):
        with pytest.raises(ValidationError) as exc_info:
            VariableMatch(
                name="variable1",
                startIndex=10,
                endIndex=5,
                isValid=True
            )
        assert "endIndex must be greater than startIndex" in str(exc_info.value)


class TestValidationResult:
    def test_valid_result(self):
        result = ValidationResult(isValid=True, errors=[])
        assert result.isValid is True
        assert len(result.errors) == 0

    def test_invalid_result_with_errors(self):
        result = ValidationResult(
            isValid=False,
            errors=["Error 1", "Error 2"]
        )
        assert result.isValid is False
        assert len(result.errors) == 2