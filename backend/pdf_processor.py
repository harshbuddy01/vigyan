"""
PDF Question Extractor with Math Equation Support
Extracts questions from PDF files and parses mathematical equations
"""

import sys
import json
import re
import PyPDF2
from typing import List, Dict, Any
import io

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text content from PDF bytes"""
    try:
        pdf_file = io.BytesIO(pdf_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        raise Exception(f"Error extracting PDF text: {str(e)}")

def detect_math_equations(text: str) -> str:
    """
    Detect and convert mathematical equations to LaTeX format
    Handles common mathematical notation patterns
    """
    # Replace common math symbols with LaTeX equivalents
    conversions = {
        r'×': r'\times',
        r'÷': r'\div',
        r'±': r'\pm',
        r'≠': r'\neq',
        r'≤': r'\leq',
        r'≥': r'\geq',
        r'∞': r'\infty',
        r'√': r'\sqrt',
        r'∑': r'\sum',
        r'∫': r'\int',
        r'π': r'\pi',
        r'α': r'\alpha',
        r'β': r'\beta',
        r'γ': r'\gamma',
        r'θ': r'\theta',
        r'λ': r'\lambda',
        r'μ': r'\mu',
        r'σ': r'\sigma',
        r'Δ': r'\Delta',
        r'Ω': r'\Omega',
    }
    
    for symbol, latex in conversions.items():
        text = text.replace(symbol, latex)
    
    # Detect superscripts (like x^2, a^n)
    text = re.sub(r'(\w+)\^(\d+|\w+)', r'\1^{\2}', text)
    
    # Detect subscripts (like x_1, a_n)
    text = re.sub(r'(\w+)_(\d+|\w+)', r'\1_{\2}', text)
    
    # Detect fractions (like a/b -> \frac{a}{b})
    text = re.sub(r'(\w+)/(\w+)', r'\\frac{\1}{\2}', text)
    
    return text

def parse_questions(text: str) -> List[Dict[str, Any]]:
    """
    Parse questions from extracted text
    Identifies question patterns and extracts question, options, and answers
    """
    questions = []
    
    # Pattern to match numbered questions (Q1., Q.1, 1., etc.)
    question_pattern = r'(?:Q\.?\s*)?(\d+)[\.\)]\s*(.*?)(?=(?:Q\.?\s*)?\d+[\.\)]|$)'
    
    matches = re.finditer(question_pattern, text, re.DOTALL)
    
    for match in matches:
        question_num = match.group(1)
        question_text = match.group(2).strip()
        
        if len(question_text) < 10:  # Skip very short matches
            continue
        
        # Extract options (A), B), C), D) or (a), b), c), d)
        options_pattern = r'[(\[]?([A-Da-d])[\)\]\.]\s*([^\n]+?)(?=[(\[]?[A-Da-d][\)\]\.]|Answer|Ans|$)'
        options_matches = list(re.finditer(options_pattern, question_text, re.IGNORECASE))
        
        options = {}
        main_question = question_text
        
        if options_matches:
            # Extract main question (text before first option)
            first_option_pos = options_matches[0].start()
            main_question = question_text[:first_option_pos].strip()
            
            # Extract all options
            for opt_match in options_matches:
                opt_label = opt_match.group(1).upper()
                opt_text = opt_match.group(2).strip()
                options[opt_label] = detect_math_equations(opt_text)
        
        # Try to extract answer
        answer_pattern = r'(?:Answer|Ans|Correct Answer)[\s:]*([A-Da-d])'
        answer_match = re.search(answer_pattern, question_text, re.IGNORECASE)
        correct_answer = answer_match.group(1).upper() if answer_match else ""
        
        # Apply math detection to main question
        main_question = detect_math_equations(main_question)
        
        # Determine difficulty (simple heuristic based on question length and complexity)
        difficulty = "medium"
        if len(main_question) < 100:
            difficulty = "easy"
        elif len(main_question) > 200 or len(options) > 4:
            difficulty = "hard"
        
        question_obj = {
            "questionNumber": int(question_num),
            "question": main_question,
            "options": options if options else {
                "A": "",
                "B": "",
                "C": "",
                "D": ""
            },
            "correctAnswer": correct_answer,
            "difficulty": difficulty,
            "explanation": "",
            "tags": []
        }
        
        questions.append(question_obj)
    
    return questions

def extract_questions_from_pdf(pdf_path: str = None, pdf_content: bytes = None) -> Dict[str, Any]:
    """
    Main function to extract questions from PDF
    Args:
        pdf_path: Path to PDF file (for file input)
        pdf_content: PDF file content as bytes (for upload)
    Returns:
        Dictionary with extracted questions and metadata
    """
    try:
        if pdf_content:
            text = extract_text_from_pdf(pdf_content)
        elif pdf_path:
            with open(pdf_path, 'rb') as file:
                text = extract_text_from_pdf(file.read())
        else:
            raise ValueError("Either pdf_path or pdf_content must be provided")
        
        questions = parse_questions(text)
        
        return {
            "success": True,
            "message": f"Successfully extracted {len(questions)} questions",
            "questionsCount": len(questions),
            "questions": questions
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error processing PDF: {str(e)}",
            "questionsCount": 0,
            "questions": []
        }

def main():
    """CLI interface for testing"""
    if len(sys.argv) < 2:
        print("Usage: python pdf_processor.py <pdf_file_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = extract_questions_from_pdf(pdf_path=pdf_path)
    
    # Print result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
