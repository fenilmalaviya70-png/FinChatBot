"""
API Routes
Defines all HTTP endpoints for the service
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import (
    ProcessDocumentRequest,
    ProcessDocumentResponse,
    QueryRequest,
    QueryResponse,
    DeleteDocumentRequest,
    HealthResponse
)
from app.services.document_processor import document_processor
from app.services.rag_service import rag_service
from app.services.enhanced_rag_service import enhanced_rag_service
from app.services.vector_store import vector_store
import os

# Create API router
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="FinChatBot Python AI Service is running"
    )


@router.post("/process-document", response_model=ProcessDocumentResponse)
async def process_document(
    request: ProcessDocumentRequest,
    background_tasks: BackgroundTasks
):
    
    try:
        print(f"\n[REQUEST] Received document processing request")
        print(f"Document ID: {request.documentId}")
        print(f"File: {request.fileName}")
        
        # Verify file exists
        if not os.path.exists(request.filePath):
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {request.filePath}"
            )
        
        # Add processing task to background
        background_tasks.add_task(
            document_processor.process_document_pipeline,
            request.documentId,
            request.filePath,
            request.fileName,
            request.vectorNamespace
        )
        
        return ProcessDocumentResponse(
            message="Document processing started successfully",
            documentId=request.documentId
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error starting document processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start processing: {str(e)}"
        )


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Enhanced Query endpoint with agentic tools and chart generation
    
    Process:
    1. Retrieve relevant document chunks from vector store
    2. Detect if calculation tools are needed
    3. Use agent with tools if needed, otherwise standard RAG
    4. Generate chart data if time-series/comparative data detected
    5. Extract source citations
    6. Return structured response
    """
    try:
        print(f"\n[REQUEST] Received query request")
        print(f"Question: {request.question[:100]}...")
        
        # Validate input
        if not request.question or not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )
        
        # Use enhanced RAG service
        result = await enhanced_rag_service.query_with_agent(
            question=request.question,
            chat_history=request.chatHistory,
            namespaces=request.vectorNamespaces,
            enable_tools=True,  # Enable agentic tools
            enable_charts=True  # Enable chart generation
        )
        
        return QueryResponse(
            answer=result["answer"],
            chart_data=result.get("chart_data"),
            citations=result.get("citations", []),
            tool_calls=result.get("tool_calls", []),
            suggestions=result.get("suggestions", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error processing query: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )


@router.post("/delete-document")
async def delete_document(request: DeleteDocumentRequest):
    """
    Delete document endpoint
    Removes document file and vector store
    
    Called by Node.js backend when a document is deleted
    """
    try:
        print(f"\n[DELETE] Received document deletion request")
        print(f"Namespace: {request.vectorNamespace}")
        
        # Delete vector store
        vector_deleted = vector_store.delete_vector_store(request.vectorNamespace)
        
        # Delete file if it exists
        file_deleted = False
        if os.path.exists(request.filePath):
            try:
                os.remove(request.filePath)
                file_deleted = True
                print(f"[OK] File deleted: {request.filePath}")
            except Exception as e:
                print(f"[WARNING] Could not delete file: {e}")
        
        return {
            "message": "Document deletion completed",
            "vectorStoreDeleted": vector_deleted,
            "fileDeleted": file_deleted
        }
        
    except Exception as e:
        print(f"[ERROR] Error deleting document: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.post("/delete-documents")
async def delete_multiple_documents(documents: list):
    """
    Delete multiple documents endpoint
    Batch deletion for conversation cleanup
    
    Called by Node.js backend when a conversation is deleted
    """
    try:
        print(f"\n[DELETE] Received batch deletion request for {len(documents)} documents")
        
        results = []
        for doc in documents:
            try:
                # Delete vector store
                vector_deleted = vector_store.delete_vector_store(
                    doc.get("vectorNamespace", "")
                )
                
                # Delete file
                file_path = doc.get("filePath", "")
                file_deleted = False
                if file_path and os.path.exists(file_path):
                    os.remove(file_path)
                    file_deleted = True
                
                results.append({
                    "namespace": doc.get("vectorNamespace"),
                    "success": True,
                    "vectorStoreDeleted": vector_deleted,
                    "fileDeleted": file_deleted
                })
                
            except Exception as e:
                print(f"[WARNING] Error deleting document: {e}")
                results.append({
                    "namespace": doc.get("vectorNamespace"),
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "message": f"Processed {len(documents)} deletions",
            "results": results
        }
        
    except Exception as e:
        print(f"[ERROR] Error in batch deletion: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete documents: {str(e)}"
        )


@router.post("/test-tools")
async def test_financial_tools():
    """
    Test endpoint for financial calculation tools
    Demonstrates tool capabilities
    """
    from app.agent.calculator import FinancialCalculator
    
    try:
        results = {
            "expression_test": FinancialCalculator.calculate("(150 - 120) / 120 * 100"),
            "growth_test": FinancialCalculator.calculate_growth(120, 150),
            "ratio_test": FinancialCalculator.calculate_ratio(300, 1000, "ROE"),
            "cagr_test": FinancialCalculator.calculate_cagr(100, 150, 3),
            "margin_test": FinancialCalculator.calculate_margin(300, 1000, "Net Margin")
        }
        
        return {
            "message": "Financial tools test completed",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Tool test failed: {str(e)}"
        )

