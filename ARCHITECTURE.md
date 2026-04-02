# KIIT SmartBus System Architecture

Here is the system architecture flow of the KIIT SmartBus project, generated using Mermaid. You can use this diagram in your documentation, presentations, or render it using any Mermaid-compatible tool (like GitHub, GitLab, or the Mermaid Live Editor).

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#3498db,stroke:#2980b9,stroke-width:2px,color:white;
    classDef auth fill:#f1c40f,stroke:#f39c12,stroke-width:2px,color:black;
    classDef db fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:white;
    classDef realtime fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:white;
    classDef external fill:#95a5a6,stroke:#7f8c8d,stroke-width:2px,color:white;

    %% Actors
    Student((Student User)):::frontend
    Driver((Driver User)):::frontend
    Admin((Admin User)):::frontend

    %% Frontend Application (React/Vite)
    subgraph FrontendApp [Frontend Application - React/Vite]
        UI[User Interface]:::frontend
        Router[App Router]:::frontend
        State[State Management / Hooks]:::frontend
        ETA[ETA Calculator]:::frontend
        MapUI[Campus Map Component]:::frontend
        
        UI --> Router
        Router --> |Renders| State
        State --> |Updates| UI
        State --> MapUI
        State --> ETA
    end

    %% User Interactions
    Student --> |Views Map, Checks ETA| UI
    Driver --> |Updates Location, Status| UI
    Admin --> |Approves Drivers, Monitors| UI

    %% Firebase Services (Backend)
    subgraph FirebaseServices [Firebase Cloud Services]
        FirebaseAuth[Firebase Authentication]:::auth
        Firestore[Firestore Database]:::db
        RTDB[Realtime Database]:::realtime
        Hosting[Firebase Hosting]:::db
    end

    %% Authentication Flow
    Router --> |Sign Up / Login / Logout| FirebaseAuth
    FirebaseAuth --> |Auth State / Tokens| State

    %% Database Flow (Firestore)
    State --> |Fetch/Update User Profiles, Bus Info| Firestore
    Admin --> |Manage Drivers & Approvals| Firestore
    
    %% Realtime Location Flow (RTDB)
    Driver --> |Sends Live GPS Coordinates| RTDB
    RTDB --> |Streams Live Locations| MapUI
    
    %% ETA Calculation
    RTDB --> |Live Location Data| ETA
    Firestore --> |Bus Status & Route| ETA
    ETA --> |Estimated Time| Student

    %% Hosting
    Hosting -.-> |Serves Web App| FrontendApp
    
    %% Data Models Note
    subgraph DataModels [Data Collections]
        UsersDoc[(Users Collection)]:::db
        BusesDoc[(Buses Collection)]:::db
        GPSDoc[(Live GPS Nodes)]:::realtime
    end
    
    Firestore -.-> UsersDoc
    Firestore -.-> BusesDoc
    RTDB -.-> GPSDoc

```

## How to use this diagram:
1. View it natively on GitHub/GitLab by opening this markdown file.
2. Copy the code block and paste it into the [Mermaid Live Editor](https://mermaid.live/) to generate a PNG/SVG image.
3. Integrate it into your `README.md` if needed by pasting the code block there.
