# VedaAI - AI-Powered Educational Assessment Platform

VedaAI is a full-stack educational platform designed to streamline the workflow of teachers and educators. By leveraging AI background workers and a Redis queue, VedaAI allows users to dynamically generate highly customized question papers based on specific subjects, grades, and difficulty levels, delivering real-time updates via WebSockets.

---

## 🏗 Architecture Overview

VedaAI utilizes a decoupled client-server architecture to ensure scalability, real-time responsiveness, and efficient handling of heavy AI generation tasks.

* **Frontend:** Next.js (App Router), React, Tailwind CSS.
* **Backend:** Node.js, TypeScript, Express.
* **Database:** MongoDB Atlas for persistent storage of assignments, users, and generated papers.
* **Task Queue & Caching:** Upstash Redis handles the background job queue (via Bull/BullMQ) to prevent API timeouts during AI generation.
* **Real-Time Communication:** WebSockets (Socket.io) provide seamless, real-time progress updates to the client while the AI generates questions in the background.
* **AI Integration:** LLM integration for customized educational content generation.

---

## 🧠 Approach

Generating complex AI assessments can take anywhere from 10 to 60 seconds, which traditionally leads to browser timeouts and a poor user experience. 

Our approach solves this by decoupling the request from the generation process:

1. **The Request:** The user submits a generation request via the Next.js frontend.
2. **The Queue:** The Node.js backend receives the request and immediately places it into a Redis queue, responding to the client instantly with a `jobId`.
3. **The Worker:** A background worker picks up the job from Redis, interfaces with the AI model, and builds the assessment.
4. **The Socket:** As the worker processes the job, it emits progress updates over WebSockets back to the specific client, creating a fluid, real-time loading experience.
5. **The Result:** Once complete, the data is saved to MongoDB, and the client is notified to fetch and render the final printable Question Paper.
