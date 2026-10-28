
Synapse — Adaptive AI Study & Time-Management System

Synapse is an intelligent, adaptive platform designed to revolutionize how students manage their academic schedules, optimize study habits, and master complex subjects. Built on top of advanced AI architectures, Synapse acts as a personalized academic co-pilot that synchronizes your course load, evaluates learning gaps, and structures dynamic schedules tailored to your individual cognitive pacing.
Live application: my-uni-guide.ai.studio

🚀 Key Features

• Adaptive Study Planner: Dynamically rearranges your calendar based on upcoming assignment weights, exam difficulty, and real-time learning progress.
• AI Cognitive Companion: Analyzes uploaded study materials, generates targeted practice problems, and identifies concepts requiring further review.
• Context-Aware Time Management: Intelligently allocates focus blocks and breaks using behavioral insights to combat burnout.
• Performance Dashboard: Visual Analytics tracking your mastery level, historical focus intervals, and milestone tracking.

🛠️ Tech Stack

• Frontend: Next.js / React, Tailwind CSS, TypeScript
• Backend: Node.js, Python (AI engine)
• Database & Vector Store: PostgreSQL, Pinecone (for course context embeddings)
• LLM Orchestration: LangChain / Claude Agent SDK

📦 Installation & Setup

Follow these steps to set up the development environment locally:

Prerequisites

• Node.js (v18+ recommended)
• Python (v3.10+ for the AI engine)
• A verified API key for your chosen LLM provider

Clone the Repository

bash
git clone https://github.com
cd synapse
Use code with caution.

Environment Configuration

Create a .env file in the root directory and configure your credentials:
env
NEXT_PUBLIC_API_URL=http://localhost:5000
DATABASE_URL=your_postgresql_connection_string
PINECONE_API_KEY=your_pinecone_key
LLM_API_KEY=your_llm_api_key
Use code with caution.

Install Dependencies

bash
# Install frontend and backend packages
npm install

# Setup python virtual environment for AI services
cd ai-engine
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
Use code with caution.

Running the Application

bash
# Start the AI engine (from the ai-engine directory)
python app.py
