"""
Financial Tools Definition
Defines tools available to the AI agent for function calling
"""

from typing import List, Dict, Any


def get_financial_tools() -> List[Dict[str, Any]]:
    """
    Get list of financial tools for OpenAI function calling
    
    Returns:
        List of tool definitions in OpenAI format
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "calculate_expression",
                "description": (
                    "Safely evaluate a mathematical expression for financial calculations. "
                    "Supports +, -, *, /, ** (power), and functions: abs, round, min, max. "
                    "Use this for exact calculations to avoid hallucination. "
                    "Example: '(150 - 120) / 120 * 100' for YoY growth percentage."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": (
                                "Mathematical expression to evaluate. "
                                "Can include numbers and operators. "
                                "Example: '(revenue - cost) / revenue * 100'"
                            )
                        },
                        "variables": {
                            "type": "object",
                            "description": (
                                "Optional dictionary of variable names to values. "
                                "Example: {'revenue': 1000, 'cost': 600}"
                            ),
                            "additionalProperties": {
                                "type": "number"
                            }
                        }
                    },
                    "required": ["expression"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_growth_rate",
                "description": (
                    "Calculate growth rate between two periods (YoY, QoQ, MoM, etc.). "
                    "Returns percentage change. "
                    "Example: old_value=120, new_value=150 returns 25% growth."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "old_value": {
                            "type": "number",
                            "description": "Value from the previous period"
                        },
                        "new_value": {
                            "type": "number",
                            "description": "Value from the current period"
                        }
                    },
                    "required": ["old_value", "new_value"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_financial_ratio",
                "description": (
                    "Calculate a financial ratio (ROE, ROA, Debt-to-Equity, etc.). "
                    "Returns the ratio value. "
                    "Example: numerator=net_income, denominator=equity, name='ROE'"
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "numerator": {
                            "type": "number",
                            "description": "Top value of the ratio"
                        },
                        "denominator": {
                            "type": "number",
                            "description": "Bottom value of the ratio"
                        },
                        "name": {
                            "type": "string",
                            "description": "Name of the ratio (e.g., 'ROE', 'Current Ratio')",
                            "default": "Ratio"
                        }
                    },
                    "required": ["numerator", "denominator"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_cagr",
                "description": (
                    "Calculate Compound Annual Growth Rate (CAGR) over multiple periods. "
                    "Returns annualized growth rate as percentage. "
                    "Example: start_value=100, end_value=150, periods=3"
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_value": {
                            "type": "number",
                            "description": "Starting value"
                        },
                        "end_value": {
                            "type": "number",
                            "description": "Ending value"
                        },
                        "periods": {
                            "type": "integer",
                            "description": "Number of periods (usually years)"
                        }
                    },
                    "required": ["start_value", "end_value", "periods"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_margin",
                "description": (
                    "Calculate profit margin as percentage. "
                    "Returns margin percentage. "
                    "Example: profit=300, revenue=1000, margin_type='Gross Margin'"
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "profit": {
                            "type": "number",
                            "description": "Profit amount (gross, operating, or net)"
                        },
                        "revenue": {
                            "type": "number",
                            "description": "Revenue amount"
                        },
                        "margin_type": {
                            "type": "string",
                            "description": "Type of margin (e.g., 'Gross Margin', 'Net Margin')",
                            "default": "Profit Margin"
                        }
                    },
                    "required": ["profit", "revenue"]
                }
            }
        }
    ]


# Tool name to function mapping
TOOL_FUNCTIONS = {
    "calculate_expression": "calculate_expression",
    "calculate_growth_rate": "calculate_growth_rate",
    "calculate_financial_ratio": "calculate_financial_ratio",
    "calculate_cagr": "calculate_cagr",
    "calculate_margin": "calculate_margin"
}


def get_tool_function(tool_name: str):
    """
    Get the actual function for a tool name
    
    Args:
        tool_name: Name of the tool
        
    Returns:
        Function object or None
    """
    from app.agent.calculator import (
        calculate_expression,
        calculate_growth_rate,
        calculate_financial_ratio,
        FinancialCalculator
    )
    
    tool_map = {
        "calculate_expression": calculate_expression,
        "calculate_growth_rate": calculate_growth_rate,
        "calculate_financial_ratio": calculate_financial_ratio,
        "calculate_cagr": FinancialCalculator.calculate_cagr,
        "calculate_margin": FinancialCalculator.calculate_margin
    }
    
    return tool_map.get(tool_name)
