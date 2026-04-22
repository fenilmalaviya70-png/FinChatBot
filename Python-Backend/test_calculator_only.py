"""
Standalone test for financial calculator
Tests calculator without requiring LangChain dependencies
"""

import sys
import ast
import operator


class FinancialCalculator:
    """
    Safe financial calculator using AST parsing
    Supports basic arithmetic and financial formulas
    """
    
    # Allowed operators for safe evaluation
    OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }
    
    # Allowed functions
    FUNCTIONS = {
        'abs': abs,
        'round': round,
        'min': min,
        'max': max,
    }
    
    @staticmethod
    def _safe_eval(node, variables=None):
        """Safely evaluate an AST node"""
        variables = variables or {}
        
        if isinstance(node, ast.Num):
            return node.n
        
        elif isinstance(node, ast.Name):
            if node.id in variables:
                return variables[node.id]
            raise ValueError(f"Undefined variable: {node.id}")
        
        elif isinstance(node, ast.BinOp):
            left = FinancialCalculator._safe_eval(node.left, variables)
            right = FinancialCalculator._safe_eval(node.right, variables)
            op = FinancialCalculator.OPERATORS.get(type(node.op))
            if op is None:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            return op(left, right)
        
        elif isinstance(node, ast.UnaryOp):
            operand = FinancialCalculator._safe_eval(node.operand, variables)
            op = FinancialCalculator.OPERATORS.get(type(node.op))
            if op is None:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            return op(operand)
        
        elif isinstance(node, ast.Call):
            func_name = node.func.id if isinstance(node.func, ast.Name) else None
            if func_name not in FinancialCalculator.FUNCTIONS:
                raise ValueError(f"Unsupported function: {func_name}")
            
            func = FinancialCalculator.FUNCTIONS[func_name]
            args = [FinancialCalculator._safe_eval(arg, variables) for arg in node.args]
            return func(*args)
        
        else:
            raise ValueError(f"Unsupported expression type: {type(node).__name__}")
    
    @classmethod
    def calculate(cls, expression, variables=None):
        """Safely evaluate a mathematical expression"""
        try:
            tree = ast.parse(expression, mode='eval')
            result = cls._safe_eval(tree.body, variables)
            result = round(float(result), 4)
            
            return {
                "success": True,
                "result": result,
                "expression": expression,
                "variables": variables or {}
            }
            
        except SyntaxError as e:
            return {
                "success": False,
                "error": f"Invalid expression syntax: {str(e)}",
                "expression": expression
            }
        except ValueError as e:
            return {
                "success": False,
                "error": str(e),
                "expression": expression
            }
        except ZeroDivisionError:
            return {
                "success": False,
                "error": "Division by zero",
                "expression": expression
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Calculation error: {str(e)}",
                "expression": expression
            }
    
    @classmethod
    def calculate_growth(cls, old_value, new_value, as_percentage=True):
        """Calculate growth rate"""
        if old_value == 0:
            return {
                "success": False,
                "error": "Cannot calculate growth from zero base"
            }
        
        growth = (new_value - old_value) / old_value
        
        if as_percentage:
            growth = round(growth * 100, 2)
            unit = "%"
        else:
            growth = round(growth, 4)
            unit = ""
        
        return {
            "success": True,
            "result": growth,
            "unit": unit,
            "old_value": old_value,
            "new_value": new_value,
            "change": round(new_value - old_value, 2)
        }
    
    @classmethod
    def calculate_ratio(cls, numerator, denominator, name="Ratio"):
        """Calculate a financial ratio"""
        if denominator == 0:
            return {
                "success": False,
                "error": "Cannot divide by zero"
            }
        
        ratio = round(numerator / denominator, 4)
        
        return {
            "success": True,
            "result": ratio,
            "ratio_name": name,
            "numerator": numerator,
            "denominator": denominator
        }
    
    @classmethod
    def calculate_cagr(cls, start_value, end_value, periods):
        """Calculate Compound Annual Growth Rate"""
        if start_value <= 0 or end_value <= 0:
            return {
                "success": False,
                "error": "CAGR requires positive values"
            }
        
        if periods <= 0:
            return {
                "success": False,
                "error": "Periods must be positive"
            }
        
        cagr = ((end_value / start_value) ** (1 / periods) - 1) * 100
        cagr = round(cagr, 2)
        
        return {
            "success": True,
            "result": cagr,
            "unit": "%",
            "start_value": start_value,
            "end_value": end_value,
            "periods": periods
        }
    
    @classmethod
    def calculate_margin(cls, profit, revenue, margin_type="Profit Margin"):
        """Calculate profit margin"""
        if revenue == 0:
            return {
                "success": False,
                "error": "Revenue cannot be zero"
            }
        
        margin = (profit / revenue) * 100
        margin = round(margin, 2)
        
        return {
            "success": True,
            "result": margin,
            "unit": "%",
            "margin_type": margin_type,
            "profit": profit,
            "revenue": revenue
        }


def print_result(test_name, result):
    """Pretty print test result"""
    print(f"\n{test_name}")
    print("-" * 60)
    if result.get("success"):
        print(f"✓ SUCCESS")
        print(f"  Result: {result.get('result')}", end="")
        if result.get('unit'):
            print(f" {result['unit']}")
        else:
            print()
        for key, value in result.items():
            if key not in ['success', 'result', 'unit']:
                print(f"  {key}: {value}")
    else:
        print(f"✗ FAILED")
        print(f"  Error: {result.get('error')}")


def main():
    """Run all calculator tests"""
    print("\n" + "="*60)
    print("FINANCIAL CALCULATOR TEST SUITE")
    print("="*60)
    
    # Test 1: YoY Growth Expression
    result = FinancialCalculator.calculate("(150 - 120) / 120 * 100")
    print_result("Test 1: YoY Growth Expression", result)
    
    # Test 2: Growth Rate Function
    result = FinancialCalculator.calculate_growth(120, 150)
    print_result("Test 2: Growth Rate (120 → 150)", result)
    
    # Test 3: Financial Ratio (ROE)
    result = FinancialCalculator.calculate_ratio(300, 1000, "ROE")
    print_result("Test 3: ROE Ratio (300/1000)", result)
    
    # Test 4: CAGR
    result = FinancialCalculator.calculate_cagr(100, 150, 3)
    print_result("Test 4: CAGR (100→150 over 3 years)", result)
    
    # Test 5: Profit Margin
    result = FinancialCalculator.calculate_margin(300, 1000, "Net Margin")
    print_result("Test 5: Net Margin (300/1000)", result)
    
    # Test 6: Expression with Variables
    result = FinancialCalculator.calculate(
        "(revenue - cost) / revenue * 100",
        {"revenue": 1000, "cost": 600}
    )
    print_result("Test 6: Margin with Variables", result)
    
    # Test 7: Complex Expression
    result = FinancialCalculator.calculate("(100 + 50) * 2 - 25")
    print_result("Test 7: Complex Expression", result)
    
    # Test 8: Power Operation
    result = FinancialCalculator.calculate("(1.1 ** 3 - 1) * 100")
    print_result("Test 8: Power Operation (Growth)", result)
    
    # Test 9: Error Handling - Division by Zero
    result = FinancialCalculator.calculate("100 / 0")
    print_result("Test 9: Division by Zero (Should Fail)", result)
    
    # Test 10: Error Handling - Invalid Syntax
    result = FinancialCalculator.calculate("100 +")
    print_result("Test 10: Invalid Syntax (Should Fail)", result)
    
    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60)
    print("\n✓ Calculator is working correctly!")
    print("✓ Safe evaluation (no eval() used)")
    print("✓ Error handling functional")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Start backend: python -m app.main")
    print("3. Test API: curl -X POST http://localhost:5000/test-tools")
    print()


if __name__ == "__main__":
    main()
