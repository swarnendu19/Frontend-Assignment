from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import time
import logging
from typing import List
from models import PipelineRequest, PipelineResponse, ErrorResponse, ErrorDetail

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Node Pipeline System API",
    description="Backend API for processing and validating node-based pipelines",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Request size limit middleware
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Middleware to limit request payload size"""
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length:
            content_length = int(content_length)
            if content_length > MAX_REQUEST_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={
                        "error": "Request payload too large",
                        "details": [
                            {
                                "type": "payload_size_error",
                                "message": f"Request size {content_length} bytes exceeds maximum allowed size of {MAX_REQUEST_SIZE} bytes"
                            }
                        ]
                    }
                )
    
    response = await call_next(request)
    return response

# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation error for {request.url}: {exc}")
    
    error_details = []
    for error in exc.errors():
        error_details.append(ErrorDetail(
            type="validation_error",
            message=error["msg"],
            field=".".join(str(loc) for loc in error["loc"]) if error["loc"] else None
        ))
    
    error_response = ErrorResponse(
        error="Request validation failed",
        details=error_details
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "error": error_response.error,
            "details": [detail.model_dump() for detail in error_response.details],
            "timestamp": error_response.timestamp.isoformat()
        }
    )

@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """Handle direct Pydantic validation errors"""
    logger.warning(f"Pydantic validation error for {request.url}: {exc}")
    
    error_details = []
    for error in exc.errors():
        error_details.append(ErrorDetail(
            type="validation_error",
            message=error["msg"],
            field=".".join(str(loc) for loc in error["loc"]) if error["loc"] else None
        ))
    
    error_response = ErrorResponse(
        error="Data validation failed",
        details=error_details
    )
    
    return JSONResponse(
        status_code=422,
        content={
            "error": error_response.error,
            "details": [detail.model_dump() for detail in error_response.details],
            "timestamp": error_response.timestamp.isoformat()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP exception for {request.url}: {exc.status_code} - {exc.detail}")
    
    error_response = ErrorResponse(
        error=exc.detail,
        details=[ErrorDetail(
            type="http_error",
            message=exc.detail
        )]
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": error_response.error,
            "details": [detail.model_dump() for detail in error_response.details],
            "timestamp": error_response.timestamp.isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error for {request.url}: {exc}", exc_info=True)
    
    error_response = ErrorResponse(
        error="Internal server error",
        details=[ErrorDetail(
            type="internal_error",
            message="An unexpected error occurred while processing your request"
        )]
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": error_response.error,
            "details": [detail.model_dump() for detail in error_response.details],
            "timestamp": error_response.timestamp.isoformat()
        }
    )

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "node-pipeline-system"}

@app.get("/health")
def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "node-pipeline-system",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.post("/pipelines/parse", response_model=PipelineResponse)
async def parse_pipeline(pipeline_request: PipelineRequest) -> PipelineResponse:
    """
    Parse and analyze a pipeline structure.
    
    This endpoint processes a pipeline request containing nodes and edges,
    performs DAG analysis, and returns structured information about the pipeline.
    
    Args:
        pipeline_request: Pipeline data containing nodes and edges
        
    Returns:
        PipelineResponse: Analysis results including node/edge counts and DAG status
        
    Raises:
        HTTPException: For validation errors or processing failures
    """
    start_time = time.time()
    
    try:
        # Import DAGAnalyzer here to avoid circular imports
        from dag_analyzer import DAGAnalyzer
        
        # Extract basic counts
        num_nodes = len(pipeline_request.nodes)
        num_edges = len(pipeline_request.edges)
        
        logger.info(f"Processing pipeline with {num_nodes} nodes and {num_edges} edges")
        
        # Create node ID set for validation
        node_ids = {node.id for node in pipeline_request.nodes}
        
        # Initialize DAG analyzer
        analyzer = DAGAnalyzer()
        
        # Build graph from edges
        analyzer.build_graph(pipeline_request.edges, node_ids)
        
        # Perform DAG analysis
        is_dag = analyzer.is_dag()
        
        # Validate graph structure and collect any validation errors
        is_valid, validation_errors = analyzer.validate_graph_structure()
        
        # Calculate processing time
        processing_time_ms = (time.time() - start_time) * 1000
        
        # Log analysis results
        logger.info(f"Pipeline analysis complete: is_dag={is_dag}, validation_errors={len(validation_errors)}, processing_time={processing_time_ms:.2f}ms")
        
        # Create response
        response = PipelineResponse(
            num_nodes=num_nodes,
            num_edges=num_edges,
            is_dag=is_dag,
            validation_errors=validation_errors,
            processing_time_ms=processing_time_ms
        )
        
        return response
        
    except ValueError as e:
        # Handle validation errors from DAG analyzer
        logger.warning(f"Pipeline validation error: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Pipeline validation failed: {str(e)}"
        )
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error processing pipeline: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the pipeline"
        )
