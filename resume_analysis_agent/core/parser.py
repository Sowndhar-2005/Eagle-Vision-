"""
Document ingestion and text extraction engine.
Converts PDFs, Markdown, and plain text files into clean, structured Markdown text.
Includes sanitization against zero-width unicode injection vulnerabilities.
"""

import os
import re
from pathlib import Path
from typing import Union
import pymupdf as fitz


def sanitize_extracted_text(text: str) -> str:
    """
    Remove invisible characters, zero-width spaces, and control codes
    that can be maliciously injected into resumes to manipulate LLM scoring.
    """
    # Remove zero-width spaces, zero-width non-joiners, zero-width joiners, byte-order marks
    zero_width_chars = [
        "\u200b", "\u200c", "\u200d", "\ufeff", "\u200e", "\u200f",
        "\u202a", "\u202b", "\u202c", "\u202d", "\u202e"
    ]
    for char in zero_width_chars:
        text = text.replace(char, "")

    # Normalize excessive newlines and whitespace
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


class ResumeParser:
    """Extracts clean markdown-formatted text from resumes."""

    @classmethod
    def parse(cls, input_source: Union[str, Path, bytes], filename: str = "resume.pdf") -> str:
        """
        Parse resume content from file path, raw text, or byte payload.

        Args:
            input_source: File path, raw text string, or binary bytes.
            filename: Original filename (used to determine format if bytes provided).

        Returns:
            Clean, structured Markdown text of the resume.
        """
        # Case 1: Raw bytes
        if isinstance(input_source, bytes):
            return cls._parse_bytes(input_source, filename)

        # Case 2: File path on disk
        if isinstance(input_source, Path) or (isinstance(input_source, str) and os.path.isfile(input_source)):
            path = Path(input_source)
            suffix = path.suffix.lower()
            if suffix == ".pdf":
                return cls._parse_pdf_file(str(path))
            else:
                try:
                    with open(path, "r", encoding="utf-8", errors="replace") as f:
                        return sanitize_extracted_text(f.read())
                except Exception as e:
                    raise ValueError(f"Failed to read text file at {path}: {str(e)}")

        # Case 3: Raw string passed directly
        if isinstance(input_source, str):
            return sanitize_extracted_text(input_source)

        raise TypeError(f"Unsupported resume input type: {type(input_source)}")

    @classmethod
    def _parse_pdf_file(cls, pdf_path: str) -> str:
        """Extract markdown from a PDF file using pymupdf4llm with PyMuPDF fallback."""
        try:
            import pymupdf4llm
            md_text = pymupdf4llm.to_markdown(pdf_path)
            if md_text and len(md_text.strip()) > 50:
                return sanitize_extracted_text(md_text)
        except Exception:
            pass

        # Fallback to direct PyMuPDF fitz extraction
        try:
            doc = fitz.open(pdf_path)
            pages_text = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if text.strip():
                    pages_text.append(f"## Page {page_num + 1}\n\n{text.strip()}")
            doc.close()
            full_text = "\n\n".join(pages_text)
            return sanitize_extracted_text(full_text)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF document {pdf_path}: {str(e)}")

    @classmethod
    def _parse_bytes(cls, data: bytes, filename: str) -> str:
        """Extract text from memory bytes."""
        if filename.lower().endswith(".pdf"):
            try:
                doc = fitz.open(stream=data, filetype="pdf")
                pages_text = []
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text = page.get_text("text")
                    if text.strip():
                        pages_text.append(f"## Page {page_num + 1}\n\n{text.strip()}")
                doc.close()
                return sanitize_extracted_text("\n\n".join(pages_text))
            except Exception as e:
                raise ValueError(f"Failed to extract text from PDF bytes: {str(e)}")
        else:
            # Treat as UTF-8 text
            try:
                return sanitize_extracted_text(data.decode("utf-8", errors="replace"))
            except Exception as e:
                raise ValueError(f"Failed to decode text bytes: {str(e)}")
