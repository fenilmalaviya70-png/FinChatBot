"""
Test script for agentic financial tools
Run this to verify tool functionality
"""

import asyncio
from app.agent.calculator import FinancialCalculator
from app.agent.orchestrator import AgentOrchestrator


def test_calculator():
    """Test financial calculator functions"""
    print("\n" + "="*60)
    print("TESTING FINANCIAL CALCULATOR")
    print("="*60)
    
    # Test 1: Expression calculation
    print("\n1. Expression Calculation (YoY Growth)")
    result = FinancialCalculator.calculate("(150 - 120) / 120 * 100")
    print(f"   Expression: (150 - 120) / 120 * 100")
    print(f"   Result: {result}")
    
    # Test 2: Growth rate
    print("\n2. Growth Rate Calculation")
    result = FinancialCalculator.calculate_growth(120, 150)
    print(f"   Old Value: 120, New Value: 150")
    print(f"   Result: {result}")
    
    # Test 3: Financial ratio
    print("\n3. Financial Ratio (ROE)")
    result = FinancialCalculator.calculate_ratio(300, 1000, "ROE")
    print(f"   Numerator: 300, Denominator: 1000")
    print(f"   Result: {result}")
    
    # Test 4: CAGR
    print("\n4. CAGR Calculation")
    result = FinancialCalculator.calculate_cagr(100, 150, 3)
    print(f"   Start: 100, End: 150, Periods: 3")
    print(f"   Result: {result}")
    
    # Test 5: Margin
    print("\n5. Profit Margin")
    result = FinancialCalculator.calculate_margin(300, 1000, "Net Margin")
    print(f"   Profit: 300, Revenue: 1000")
    print(f"   Result: {result}")
    
    # Test 6: Complex expression with variables
    print("\n6. Expression with Variables")
    result = FinancialCalculator.calculate(
        "(revenue - cost) / revenue * 100",
        {"revenue": 1000, "cost": 600}
    )
    print(f"   Expression: (revenue - cost) / revenue * 100")
    print(f"   Variables: revenue=1000, cost=600")
    print(f"   Result: {result}")
    
    # Test 7: Error handling (division by zero)
    print("\n7. Error Handling (Division by Zero)")
    result = FinancialCalculator.calculate("100 / 0")
    print(f"   Expression: 100 / 0")
    print(f"   Result: {result}")
    
    print("\n" + "="*60)
    print("CALCULATOR TESTS COMPLETED")
    print("="*60)


async def test_agent():
    """Test agent orchestrator"""
    print("\n" + "="*60)
    print("TESTING AGENT ORCHESTRATOR")
    print("="*60)
    
    orchestrator = AgentOrchestrator()
    
    # Mock context with financial data
    context = """
    Financial Summary (Page 12):
    - 2022 Revenue: $120 million
    - 2023 Revenue: $150 million
    - 2023 Net Income: $30 million
    - Total Assets: $500 million
    """
    
    question = "Calculate the YoY revenue growth from 2022 to 2023"
    
    print(f"\nQuestion: {question}")
    print(f"\nContext: {context.strip()}")
    
    print("\n[Running agent with tools...]")
    
    try:
        result = await orchestrator.run_agent(
            question=question,
            context=context,
            chat_history=[],
            max_iterations=3
        )
        
        print("\n" + "-"*60)
        print("AGENT RESULT:")
        print("-"*60)
        print(f"\nAnswer:\n{result['answer']}")
        print(f"\nTool Calls: {len(result['tool_calls'])}")
        for i, tool_call in enumerate(result['tool_calls'], 1):
            print(f"\n  {i}. {tool_call['tool']}")
            print(f"     Args: {tool_call['args']}")
            print(f"     Result: {tool_call['result']}")
        
        print("\n" + "="*60)
        print("AGENT TEST COMPLETED")
        print("="*60)
        
    except Exception as e:
        print(f"\n[ERROR] Agent test failed: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("FINANCIAL AGENT TOOLS TEST SUITE")
    print("="*60)
    
    # Test calculator
    test_calculator()
    
    # Test agent (requires async)
    print("\n\nStarting agent test...")
    try:
        asyncio.run(test_agent())
    except Exception as e:
        print(f"\n[WARNING] Agent test skipped: {e}")
        print("This is expected if GROQ_API_KEY is not configured.")
    
    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
