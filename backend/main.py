from pathlib import Path
import sqlite3
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_PATH = Path(__file__).with_name("ml_lab.db")

app = FastAPI(title="ML Learning Lab API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROADMAP = [
    {"id":"python", "phase":1, "title":"Python Programming", "level":"Beginner",
     "topics":["Variables and data types","Conditions and loops","Functions","Lists, tuples, sets and dictionaries","Files, exceptions and modules","OOP basics"]},
    {"id":"math-libraries", "phase":2, "title":"Maths and Python Libraries", "level":"Beginner",
     "topics":["NumPy arrays","Pandas DataFrames","Matplotlib and Seaborn","Descriptive statistics","Probability basics","Vectors, matrices and derivatives"]},
    {"id":"eda", "phase":3, "title":"Data Analysis and EDA", "level":"Beginner",
     "topics":["Data cleaning","Missing values and outliers","Univariate and bivariate analysis","Correlation","Data leakage","EDA mini-project"]},
    {"id":"core-ml", "phase":4, "title":"Core Machine Learning", "level":"Beginner–Intermediate",
     "topics":["Train-test split","Linear Regression","Logistic Regression","KNN and Naive Bayes","Decision Trees and SVM","Metrics and cross-validation","Pipelines and preprocessing"]},
    {"id":"features", "phase":5, "title":"Feature Engineering", "level":"Intermediate",
     "topics":["Categorical encoding","Scaling and transformations","Feature construction","Feature selection","Imputation","Imbalanced datasets"]},
    {"id":"ensembles", "phase":6, "title":"Ensemble Learning", "level":"Intermediate",
     "topics":["Bagging","Random Forest","AdaBoost","Gradient Boosting","XGBoost","Stacking and Blending","Hyperparameter tuning"]},
    {"id":"unsupervised-deploy", "phase":7, "title":"Unsupervised ML and Deployment", "level":"Intermediate",
     "topics":["K-Means","Hierarchical clustering and DBSCAN","PCA","Model persistence","Streamlit apps","FastAPI basics","Deployment fundamentals"]},
    {"id":"deep-learning", "phase":8, "title":"Deep Learning and Portfolio", "level":"Advanced",
     "topics":["Neural network fundamentals","Forward and backward propagation","TensorFlow or PyTorch","CNN basics","Sequence models","Portfolio project and documentation"]},
]

LESSONS = {
    "python": {
        "title": "Python: Variables and Data Types",
        "explanation": "A variable is a name that refers to a value. Python commonly uses int, float, str and bool types. Start by predicting outputs, then run the code in a notebook.",
        "code": "name = 'GD Bhai'\\nage = 20\\nscore = 8.5\\nis_learning = True\\n\\nprint(name)\\nprint(age + 1)\\nprint(type(score))",
        "task": "Change age and score. Predict the output before running the code."
    },
    "math-libraries": {
        "title": "NumPy: Arrays",
        "explanation": "NumPy arrays store numerical data efficiently and support vectorized operations. ML libraries use array-like data extensively.",
        "code": "import numpy as np\\n\\nx = np.array([2, 4, 6])\\nprint(x.mean())\\nprint(x * 2)",
        "task": "Create an array of five marks and calculate its mean."
    },
    "eda": {
        "title": "EDA: Inspecting a dataset",
        "explanation": "Exploratory Data Analysis helps you understand columns, data types, missing values, distributions and relationships before modelling.",
        "code": "import pandas as pd\\n\\ndf = pd.read_csv('your_dataset.csv')\\nprint(df.head())\\nprint(df.shape)\\nprint(df.info())\\nprint(df.isna().sum())",
        "task": "Use a small CSV and report its number of rows, columns and missing values."
    },
    "core-ml": {
        "title": "Machine Learning: Train-test split",
        "explanation": "Training data is used to fit a model. Test data estimates performance on unseen examples. Split before fitting preprocessing steps to avoid data leakage.",
        "code": "from sklearn.model_selection import train_test_split\\n\\nX_train, X_test, y_train, y_test = train_test_split(\\n    X, y, test_size=0.2, random_state=42\\n)",
        "task": "Explain why we keep a test set separate from training."
    },
    "features": {
        "title": "Feature Engineering: Encoding",
        "explanation": "Many estimators need numerical features. One-hot encoding represents categories using indicator columns; ordinal encoding assigns integer codes and should be used carefully.",
        "code": "import pandas as pd\\n\\ndf = pd.DataFrame({'city': ['Lucknow', 'Delhi', 'Lucknow']})\\nencoded = pd.get_dummies(df, columns=['city'], dtype=int)\\nprint(encoded)",
        "task": "Try encoding a column containing two job roles."
    },
    "ensembles": {
        "title": "Ensemble Learning: XGBoost",
        "explanation": "Boosting builds an additive model in stages. Each new tree improves the current ensemble objective. Learning rate scales the contribution of each new tree.",
        "code": "from xgboost import XGBRegressor\\n\\nmodel = XGBRegressor(\\n    n_estimators=50, max_depth=2,\\n    learning_rate=0.05, random_state=42\\n)\\n# model.fit(X_train, y_train)\\n# predictions = model.predict(X_test)",
        "task": "Describe how learning_rate and n_estimators affect boosting."
    },
    "unsupervised-deploy": {
        "title": "Clustering: K-Means",
        "explanation": "K-Means groups points around cluster centroids. Scale features when their numeric ranges differ substantially, and choose the number of clusters with domain context and diagnostics.",
        "code": "from sklearn.cluster import KMeans\\n\\nmodel = KMeans(n_clusters=3, random_state=42, n_init='auto')\\n# labels = model.fit_predict(X_scaled)",
        "task": "Explain what a centroid represents."
    },
    "deep-learning": {
        "title": "Deep Learning: Neural network basics",
        "explanation": "A neural network combines weighted inputs, biases and activation functions across layers. Training adjusts parameters to reduce a loss function.",
        "code": "import torch\\nfrom torch import nn\\n\\nmodel = nn.Sequential(\\n    nn.Linear(4, 16),\\n    nn.ReLU(),\\n    nn.Linear(16, 1)\\n)\\nprint(model)",
        "task": "Identify the input size, hidden layer size and output size."
    }
}

QUIZ = {
    "question": "Why do we use a train-test split?",
    "options": [
        {"id":"a", "text":"To make the dataset larger"},
        {"id":"b", "text":"To estimate how the model performs on unseen data"},
        {"id":"c", "text":"To guarantee 100% accuracy"}
    ],
    "correct": "b",
    "explanation": "A separate test set gives an estimate of generalization to unseen examples, provided it is not used for model selection."
}

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                topic_id TEXT PRIMARY KEY,
                completed INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id TEXT NOT NULL,
                selected_answer TEXT NOT NULL,
                is_correct INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

init_db()

class ProgressUpdate(BaseModel):
    completed: bool

class QuizSubmission(BaseModel):
    answer: str

@app.get("/")
def health():
    return {"status": "ok", "app": "ML Learning Lab API"}

@app.get("/api/roadmap")
def get_roadmap():
    with connect() as conn:
        rows = conn.execute("SELECT topic_id, completed FROM progress").fetchall()
    status = {row["topic_id"]: bool(row["completed"]) for row in rows}
    result = []
    for phase in ROADMAP:
        item = dict(phase)
        item["completed"] = status.get(item["id"], False)
        result.append(item)
    return result

@app.get("/api/lessons/{topic_id}")
def get_lesson(topic_id: str):
    lesson = LESSONS.get(topic_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"topic_id": topic_id, **lesson}

@app.put("/api/progress/{topic_id}")
def update_progress(topic_id: str, body: ProgressUpdate):
    if topic_id not in {phase["id"] for phase in ROADMAP}:
        raise HTTPException(status_code=404, detail="Topic not found")
    with connect() as conn:
        conn.execute(
            "INSERT INTO progress(topic_id, completed) VALUES(?, ?) "
            "ON CONFLICT(topic_id) DO UPDATE SET completed=excluded.completed",
            (topic_id, int(body.completed))
        )
    return {"topic_id": topic_id, "completed": body.completed}

@app.get("/api/quiz")
def get_quiz():
    return {k: v for k, v in QUIZ.items() if k != "correct"}

@app.post("/api/quiz")
def submit_quiz(body: QuizSubmission):
    correct = body.answer == QUIZ["correct"]
    with connect() as conn:
        conn.execute(
            "INSERT INTO quiz_attempts(quiz_id, selected_answer, is_correct) VALUES(?, ?, ?)",
            ("train-test-split", body.answer, int(correct))
        )
    return {"correct": correct, "explanation": QUIZ["explanation"]}

@app.get("/api/stats")
def get_stats():
    with connect() as conn:
        total = conn.execute("SELECT COUNT(*) AS n FROM progress WHERE completed=1").fetchone()["n"]
        attempts = conn.execute("SELECT COUNT(*) AS n FROM quiz_attempts").fetchone()["n"]
        correct = conn.execute("SELECT COUNT(*) AS n FROM quiz_attempts WHERE is_correct=1").fetchone()["n"]
    return {
        "completed_phases": total,
        "total_phases": len(ROADMAP),
        "quiz_attempts": attempts,
        "quiz_accuracy_percent": round(100 * correct / attempts, 1) if attempts else 0
    }
