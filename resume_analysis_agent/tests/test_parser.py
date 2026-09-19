"""Unit tests for document ingestion and parser."""

import pytest
from pathlib import Path
from resume_analysis_agent.core.parser import ResumeParser, sanitize_extracted_text


def test_sanitize_extracted_text():
    # Inject zero width space (\u200b) and byte-order mark (\ufeff)
    dirty_text = "Software\u200b Engineer\ufeff with Python\r\n\r\n\n\nexperience."
    cleaned = sanitize_extracted_text(dirty_text)
    assert "\u200b" not in cleaned
    assert "\ufeff" not in cleaned
    assert "Software Engineer with Python\n\nexperience." == cleaned


def test_parser_from_text(sample_resume_text):
    parsed = ResumeParser.parse(sample_resume_text)
    assert "Maya Lin" in parsed
    assert "FastAPI" in parsed
    assert "Education" in parsed


def test_parser_from_file_path(sample_resume_path):
    parsed = ResumeParser.parse(sample_resume_path)
    assert "Maya Lin" in parsed
    assert "maya.lin@example.edu" in parsed


def test_parser_from_bytes(sample_resume_text):
    raw_bytes = sample_resume_text.encode("utf-8")
    parsed = ResumeParser.parse(raw_bytes, filename="resume.txt")
    assert "Maya Lin" in parsed
