Project Overview

AI Presentation Coach is a web-based application designed to assist presenters by analyzing slide content and generating AI-powered speaker notes, timing recommendations, transitions, and real-time presentation guidance.

The system provides:

A Speaker View with AI-generated notes, pacing feedback, and transitions

An Audience View that mirrors slide progression

A Custom Presentation Editor to create and analyze slides

Real-time synchronization using WebSockets

Backend AI analysis powered by Azure OpenAI Foundry

This project demonstrates a full-stack, cloud-deployed system integrating modern frontend frameworks, real-time communication, containerization, and AI services.

Main Components
1. Frontend (React + Vite)

Located in the /frontend directory.

Key features:

Presentation creation and editing

Speaker View with AI-generated notes and timing

Audience View for live slide display

Review Panel to inspect and edit AI output

Socket.IO client for real-time slide synchronization

Technologies:

React

JavaScript (ES6)

Socket.IO Client

Vite (build tool)

2. Backend (Node.js + Express + Socket.IO)

Located in the /backend directory.

Key features:

REST API for creating and retrieving presentations

AI analysis endpoint using Azure OpenAI

WebSocket server for real-time slide updates

Presentation data storage (JSON-based for prototype)

Technologies:

Node.js

Express

Socket.IO

Azure OpenAI SDK

3. AI Integration (Azure OpenAI Foundry)

The backend sends slide content to an Azure OpenAI deployment, which returns structured JSON containing:

Slide importance

Recommended speaking time

Speaker notes

Key talking points

Speaking script

Transitions between slides

The AI output is parsed and stored per presentation and displayed in the Speaker View.

Note: Azure credentials are stored securely on the VM using environment variables and are not included in the repository.

4. Real-Time Communication (Socket.IO)

Socket.IO enables:

Live slide advancement

Synchronization between Speaker View and Audience View

Multi-client support for the same presentation session

5. Deployment (Docker + Azure VM)

The entire application is containerized using Docker

A single container serves both frontend and backend

Deployed on an Azure Virtual Machine

Port 80 is exposed publicly and mapped to the app’s internal port

How to Use the Application

Visit the live site:
http://20.80.232.128/

Create a demo presentation or create a custom presentation.

Enter slide titles and content.

Click “Save & Analyze Presentation” to generate AI insights.

Use:

Speaker View for notes, timing, and transitions

Audience View for projected slides

Slide changes are synchronized in real time.