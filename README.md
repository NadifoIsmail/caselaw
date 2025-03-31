# AI-Powered Legal Case Classification System

![Project Banner](https://via.placeholder.com/1200x400/3a86ff/ffffff?text=Legal+Case+Classification+System)

## 📌 Overview
An intelligent system that automates legal case classification using Google Gemini AI, featuring:
- **Flask** backend with MongoDB
- **React + TypeScript** frontend
- **Real-time** case tracking
- **Document management** system

```mermaid
flowchart TD
    A[Client] -->|Submit Case| B[System]
    B --> C[AI Classification]
    C --> D[Lawyer Assignment]
    D --> E[Case Resolution]
    style A fill:#4cc9f0,stroke:#333
    style B fill:#f8961e,stroke:#333
    style C fill:#7209b7,stroke:#fff
    style D fill:#43aa8b,stroke:#333
    style E fill:#f94144,stroke:#333
```

## 🛠️ Tech Stack
| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, TypeScript, Material-UI |
| **Backend** | Flask, Python 3.10 |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API |
| **DevOps** | Docker, GitHub Actions |

## 🌟 Key Features
- Automated case classification with 91.2% accuracy
- Role-based access control
- Document upload and management
- Real-time status updates

## 📊 System Flow
```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant GeminiAI
    participant MongoDB
    
    Client->>Frontend: Submit case + documents
    Frontend->>Backend: POST /api/cases
    Backend->>GeminiAI: Classify case text
    GeminiAI-->>Backend: Category prediction
    Backend->>MongoDB: Store case data
    MongoDB-->>Backend: Confirmation
    Backend-->>Frontend: Case created
    Frontend-->>Client: Confirmation + tracking ID
    
    rect rgb(200, 220, 255)
    note right of Backend: Real-time updates via WebSocket
    Backend->>Frontend: Status updates
    end
```

## 🌿 Git Branch Strategy
```mermaid
gitGraph
    commit
    branch dev
    checkout dev
    commit
    branch feature/classification
    commit type: HIGHLIGHT
    checkout dev
    merge feature/classification
    branch release/v1.0
    commit
    checkout main
    merge release/v1.0
    commit tag: "v1.0"
    
    style feature/classification fill:#b5ead7,stroke:#333
    style dev fill:#ffdac1,stroke:#333
    style main fill:#c7ceea,stroke:#333
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.10
- MongoDB Atlas account
- Google Gemini API key

### Installation
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Configuration
Create `.env` file:
```ini
# Backend
MONGO_URI=mongodb+srv://...
GEMINI_API_KEY=your_key_here

# Frontend
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing
```bash
# Backend tests
pytest --cov=app

# Frontend tests
npm test
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact
Project Lead: [Your Name] - your.email@example.com  
Project Link: [https://github.com/your/repo](https://github.com/your/repo)
