"""
Pydantic models for data validation and serialization.
These models mirror the TypeScript interfaces for consistency.
"""

from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class Point(BaseModel):
    """2D coordinate point"""
    x: float
    y: float


class Dimensions(BaseModel):
    """Width and height dimensions"""
    width: float = Field(gt=0, description="Width must be positive")
    height: float = Field(gt=0, description="Height must be positive")


class SizeConstraints(BaseModel):
    """Size constraints for resizable elements"""
    minWidth: float = Field(ge=0)
    maxWidth: float = Field(gt=0)
    minHeight: float = Field(ge=0)
    maxHeight: float = Field(gt=0)
    padding: float = Field(ge=0)

    @field_validator('maxWidth')
    @classmethod
    def max_width_greater_than_min(cls, v, info):
        if info.data.get('minWidth') is not None and v <= info.data['minWidth']:
            raise ValueError('maxWidth must be greater than minWidth')
        return v

    @field_validator('maxHeight')
    @classmethod
    def max_height_greater_than_min(cls, v, info):
        if info.data.get('minHeight') is not None and v <= info.data['minHeight']:
            raise ValueError('maxHeight must be greater than minHeight')
        return v


class HandleDefinition(BaseModel):
    """Definition of a node handle (connection point)"""
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    dataType: str = Field(min_length=1)
    optional: bool = False
    position: Literal['left', 'right', 'top', 'bottom']


class ValidationRule(BaseModel):
    """Validation rule for form fields"""
    type: Literal['required', 'minLength', 'maxLength', 'pattern']
    value: Optional[Any] = None
    message: str = Field(min_length=1)


class FieldDefinition(BaseModel):
    """Definition of an editable field in a node"""
    name: str = Field(min_length=1)
    type: Literal['text', 'textarea', 'select', 'number']
    validation: Optional[List[ValidationRule]] = None


class UIHints(BaseModel):
    """UI rendering hints for nodes"""
    widthMin: float = Field(ge=0)
    widthMax: float = Field(gt=0)
    heightMin: float = Field(ge=0)
    heightMax: float = Field(gt=0)
    color: str = Field(pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: str = Field(min_length=1)
    resizable: bool = True

    @field_validator('widthMax')
    @classmethod
    def width_max_greater_than_min(cls, v, info):
        if info.data.get('widthMin') is not None and v <= info.data['widthMin']:
            raise ValueError('widthMax must be greater than widthMin')
        return v

    @field_validator('heightMax')
    @classmethod
    def height_max_greater_than_min(cls, v, info):
        if info.data.get('heightMin') is not None and v <= info.data['heightMin']:
            raise ValueError('heightMax must be greater than heightMin')
        return v


class NodeMetadata(BaseModel):
    """Complete metadata definition for a node type"""
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    label: str = Field(min_length=1)
    inputs: List[HandleDefinition] = []
    outputs: List[HandleDefinition] = []
    uiHints: UIHints
    editableFields: List[FieldDefinition] = []


class NodeData(BaseModel):
    """Node data for API requests"""
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    data: Dict[str, Any] = {}
    position: Point


class EdgeData(BaseModel):
    """Edge data for API requests"""
    id: str = Field(min_length=1)
    source: str = Field(min_length=1)
    target: str = Field(min_length=1)
    sourceHandle: str = Field(min_length=1)
    targetHandle: str = Field(min_length=1)

    @field_validator('target')
    @classmethod
    def target_different_from_source(cls, v, info):
        if info.data.get('source') is not None and v == info.data['source']:
            raise ValueError('target cannot be the same as source')
        return v


class PipelineMetadata(BaseModel):
    """Pipeline metadata"""
    version: str = Field(default="1.0.0")
    created: datetime = Field(default_factory=datetime.now)
    modified: datetime = Field(default_factory=datetime.now)


class PipelineRequest(BaseModel):
    """Request payload for pipeline processing"""
    nodes: List[NodeData] = Field(min_length=1, description="Pipeline must contain at least one node")
    edges: List[EdgeData] = []
    metadata: Optional[PipelineMetadata] = None

    @field_validator('edges')
    @classmethod
    def validate_edges_reference_existing_nodes(cls, v, info):
        if info.data.get('nodes') is None:
            return v
        
        node_ids = {node.id for node in info.data['nodes']}
        for edge in v:
            if edge.source not in node_ids:
                raise ValueError(f'Edge source "{edge.source}" references non-existent node')
            if edge.target not in node_ids:
                raise ValueError(f'Edge target "{edge.target}" references non-existent node')
        return v


class PipelineResponse(BaseModel):
    """Response payload for pipeline processing"""
    num_nodes: int = Field(ge=0)
    num_edges: int = Field(ge=0)
    is_dag: bool
    validation_errors: List[str] = []
    processing_time_ms: Optional[float] = None


class VariableMatch(BaseModel):
    """Detected variable in text content"""
    name: str = Field(min_length=1)
    startIndex: int = Field(ge=0)
    endIndex: int = Field(gt=0)
    isValid: bool

    @field_validator('endIndex')
    @classmethod
    def end_index_greater_than_start(cls, v, info):
        if info.data.get('startIndex') is not None and v <= info.data['startIndex']:
            raise ValueError('endIndex must be greater than startIndex')
        return v


class ValidationResult(BaseModel):
    """Result of data validation"""
    isValid: bool
    errors: List[str] = []


# Error response models
class ErrorDetail(BaseModel):
    """Error detail structure"""
    type: str
    message: str
    field: Optional[str] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    details: List[ErrorDetail] = []
    timestamp: datetime = Field(default_factory=datetime.now)
    
    model_config = {
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }