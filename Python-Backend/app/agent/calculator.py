"""
Financial Calculator Tool
Production-safe calculator using AST parsing (no eval)
Performs exact financial calculations without hallucination risk
"""

import ast
import operator
from typing import Dict, Any, Union
from decimal import Decimal, InvalidOperation


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
    def _safe_eval(node, variables: Dict[str, float] = None):
        """
        Safely evaluate an AST node
        
        Args:
            node: AST node to evaluate
            variables: Dictionary of variable names to values
            
        Returns:
            Evaluated result
        """
        variables = variables or {}
        
        if isinstance(node, ast.Num):  # Number
            return node.n
        
        elif isinstance(node, ast.Name):  # Variable
            if node.id in variables:
                return variables[node.id]
            raise ValueError(f"Undefined variable: {node.id}")
        
        elif isinstance(node, ast.BinOp):  # Binary operation
            left = FinancialCalculator._safe_eval(node.left, variables)
            right = FinancialCalculator._safe_eval(node.right, variables)
            op = FinancialCalculator.OPERATORS.get(type(node.op))
            if op is None:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            return op(left, right)
        
        elif isinstance(node, ast.UnaryOp):  # Unary operation
            operand = FinancialCalculator._safe_eval(node.operand, variables)
            op = FinancialCalculator.OPERATORS.get(type(node.op))
            if op is None:
                raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
            return op(operand)
        
        elif isinstance(node, ast.Call):  # Function call
            func_name = node.func.id if isinstance(node.func, ast.Name) else None
            if func_name not in FinancialCalculator.FUNCTIONS:
                raise ValueError(f"Unsupported function: {func_name}")
            
            func = FinancialCalculator.FUNCTIONS[func_name]
            args = [FinancialCalculator._safe_eval(arg, variables) for arg in node.args]
            return func(*args)
        
        else:
            raise ValueError(f"Unsupported expression type: {type(node).__name__}")
    
    @classmethod
    def calculate(cls, expression: str, variables: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Safely evaluate a mathematical expression
        
        Args:
            expression: Mathematical expression as string
            variables: Optional dictionary of variable values
            
        Returns:
            Dictionary with result or error
            
        Examples:
            calculate("(150 - 120) / 120 * 100")  # YoY growth
            calculate("revenue / assets", {"revenue": 1000, "assets": 5000})
        """
        try:
            # Parse expression into AST
            tree = ast.parse(expression, mode='eval')
            
            # Evaluate safely
            result = cls._safe_eval(tree.body, variables)
            
            # Round to 4 decimal places for financial precision
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
    def calculate_ratio(cls, numerator: float, denominator: float, name: str = "Ratio") -> Dict[str, Any]:
        """
        Calculate a financial ratio
        
        Args:
            numerator: Top value
            denominator: Bottom value
            name: Name of the ratio
            
        Returns:
            Dictionary with ratio result
        """
        if denominator == 0:
            return {
                "success": False,
                "error": "Cannot divide by zero",
                "ratio_name": name
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
    def calculate_growth(cls, old_value: float, new_value: float, as_percentage: bool = True) -> Dict[str, Any]:
        """
        Calculate growth rate (YoY, QoQ, etc.)
        
        Args:
            old_value: Previous period value
            new_value: Current period value
            as_percentage: Return as percentage (default True)
            
        Returns:
            Dictionary with growth calculation
        """
        if old_value == 0:
            return {
                "success": False,
                "error": "Cannot calculate growth from zero base",
                "old_value": old_value,
                "new_value": new_value
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
    def calculate_cagr(cls, start_value: float, end_value: float, periods: int) -> Dict[str, Any]:
        """
        Calculate Compound Annual Growth Rate
        
        Args:
            start_value: Starting value
            end_value: Ending value
            periods: Number of periods (years)
            
        Returns:
            Dictionary with CAGR calculation
        """
        if start_value <= 0 or end_value <= 0:
            return {
                "success": False,
                "error": "CAGR requires positive values",
                "start_value": start_value,
                "end_value": end_value
            }
        
        if periods <= 0:
            return {
                "success": False,
                "error": "Periods must be positive",
                "periods": periods
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
    def calculate_margin(cls, profit: float, revenue: float, margin_type: str = "Profit Margin") -> Dict[str, Any]:
        """
        Calculate profit margin
        
        Args:
            profit: Profit amount
            revenue: Revenue amount
            margin_type: Type of margin (for labeling)
            
        Returns:
            Dictionary with margin calculation
        """
        if revenue == 0:
            return {
                "success": False,
                "error": "Revenue cannot be zero",
                "margin_type": margin_type
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


# Convenience functions for tool calling
def calculate_expression(expression: str, variables: Dict[str, float] = None) -> Dict[str, Any]:
    """Tool-callable wrapper for expression calculation"""
    return FinancialCalculator.calculate(expression, variables)


def calculate_growth_rate(old_value: float, new_value: float) -> Dict[str, Any]:
    """Tool-callable wrapper for growth calculation"""
    return FinancialCalculator.calculate_growth(old_value, new_value)


def calculate_financial_ratio(numerator: float, denominator: float, name: str = "Ratio") -> Dict[str, Any]:
    """Tool-callable wrapper for ratio calculation"""
    return FinancialCalculator.calculate_ratio(numerator, denominator, name)
