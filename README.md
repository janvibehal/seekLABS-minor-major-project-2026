# Automated Programming Logic Assessment

## Project Description

An AI-based assessment system that evaluates students' programming logic through step-by-step explanations or pseudocode instead of only evaluating source code.

## Problem

Students can often copy and paste code without fully understanding the underlying programming logic.

## Proposed Solution

The system evaluates a candidate's explanation of a programming solution using LLMs, embeddings, and rule-based validation to measure logical understanding.

## Users

- Candidate
- Recruiter

## Technology Stack

### Frontend
React + Vite

### Backend
Python + FastAPI

### Database
PostgreSQL

### LLM
Ollama + selected LLM

### Embeddings
Sentence-Transformers

### Infrastructure
Docker + GitHub Actions

## Repository Structure

```text
frontend/     React/Vite application
backend/      FastAPI application
data/         Problems and related data
database/     Database documentation and schema
.github/      GitHub Actions workflows