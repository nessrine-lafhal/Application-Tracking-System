import streamlit as st
import sqlite3
import os
import pandas as pd
import numpy as np
import cv2
import tempfile
from PIL import Image
import time
import spacy
import pytesseract
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import re
import io
import base64
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase
import mediapipe as mp
import layoutparser as lp
import matplotlib.pyplot as plt
from pathlib import Path

# Configuration de la page
st.set_page_config(
    page_title="ATS Intelligent",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialisation de la base de données
def init_db():
    conn = sqlite3.connect('ats_database.db')
    c = conn.cursor()
    
    # Table des candidats
    c.execute('''
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        cv_path TEXT,
        job_id INTEGER,
        cv_match_score REAL,
        written_interview_score REAL,
        video_interview_score REAL,
        documents_score REAL,
        final_score REAL,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Table des offres d'emploi
    c.execute('''
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        required_skills TEXT,
        required_experience INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Table des documents
    c.execute('''
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER,
        document_type TEXT,
        document_path TEXT,
        authenticity_score REAL,
        verified BOOLEAN,
        FOREIGN KEY (candidate_id) REFERENCES candidates (id)
    )
    ''')
    
    # Table des entretiens
    c.execute('''
    CREATE TABLE IF NOT EXISTS interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER,
        job_id INTEGER,
        questions TEXT,
        answers TEXT,
        written_score REAL,
        video_score REAL,
        emotions_data TEXT,
        FOREIGN KEY (candidate_id) REFERENCES candidates (id),
        FOREIGN KEY (job_id) REFERENCES jobs (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialisation des modèles NLP
@st.cache_resource
def load_nlp_models():
    # Chargement du modèle spaCy
    nlp = spacy.load("fr_core_news_md")
    
    # Chargement du modèle de transformers pour l'analyse sémantique
    tokenizer = AutoTokenizer.from_pretrained("camembert-base")
    model = AutoModel.from_pretrained("camembert-base")
    
    # Modèle pour la classification de documents
    document_model = lp.Detectron2LayoutModel(
        'lp://PubLayNet/mask_rcnn_X_101_32x8d_FPN_3x/config',
        extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.8],
        label_map={0: "Text", 1: "Title", 2: "List", 3: "Table", 4: "Figure"}
    )
    
    return {
        "nlp": nlp,
        "tokenizer": tokenizer,
        "model": model,
        "document_model": document_model
    }

# Fonction pour extraire le texte d'un PDF
def extract_text_from_pdf(pdf_file):
    try:
        import PyPDF2
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        st.error(f"Erreur lors de l'extraction du texte du PDF: {e}")
        return ""

# Fonction pour extraire le texte d'un document Word
def extract_text_from_docx(docx_file):
    try:
        import docx
        doc = docx.Document(docx_file)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        st.error(f"Erreur lors de l'extraction du texte du document Word: {e}")
        return ""

# Fonction pour calculer le score de matching entre CV et description de poste
def calculate_matching_score(cv_text, job_description, models):
    nlp = models["nlp"]
    tokenizer = models["tokenizer"]
    model = models["model"]
    
    # Traitement avec spaCy pour l'extraction d'entités
    cv_doc = nlp(cv_text)
    job_doc = nlp(job_description)
    
    # Extraction des compétences et expériences
    cv_skills = [ent.text for ent in cv_doc.ents if ent.label_ in ["SKILL", "ORG", "PRODUCT"]]
    job_skills = [ent.text for ent in job_doc.ents if ent.label_ in ["SKILL", "ORG", "PRODUCT"]]
    
    # Calcul de similarité avec transformers
    cv_inputs = tokenizer(cv_text, return_tensors="pt", truncation=True, max_length=512, padding=True)
    job_inputs = tokenizer(job_description, return_tensors="pt", truncation=True, max_length=512, padding=True)
    
    with torch.no_grad():
        cv_outputs = model(**cv_inputs)
        job_outputs = model(**job_inputs)
    
    cv_embeddings = cv_outputs.last_hidden_state.mean(dim=1)
    job_embeddings = job_outputs.last_hidden_state.mean(dim=1)
    
    # Calcul de la similarité cosinus
    similarity = cosine_similarity(
        cv_embeddings.detach().numpy(),
        job_embeddings.detach().numpy()
    )[0][0]
    
    # Calcul du score final (0-100)
    matching_score = similarity * 100
    
    return min(max(matching_score, 0), 100)

# Classe pour la détection des émotions faciales
class EmotionDetector(VideoTransformerBase):
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_detection = self.mp_face_detection.FaceDetection(min_detection_confidence=0.5)
        self.face_mesh = self.mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.emotions = {
            0: "Colère",
            1: "Dégoût",
            2: "Peur",
            3: "Joie",
            4: "Tristesse",
            5: "Surprise",
            6: "Neutre"
        }
        self.emotion_counts = {emotion: 0 for emotion in self.emotions.values()}
        self.frame_count = 0
        
    def transform(self, frame):
        img = frame.to_ndarray(format="bgr24")
        
        # Détection du visage
        results = self.face_detection.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        if results.detections:
            for detection in results.detections:
                bboxC = detection.location_data.relative_bounding_box
                ih, iw, _ = img.shape
                bbox = int(bboxC.xmin * iw), int(bboxC.ymin * ih), \
                       int(bboxC.width * iw), int(bboxC.height * ih)
                
                # Extraction du visage
                face = img[bbox[1]:bbox[1]+bbox[3], bbox[0]:bbox[0]+bbox[2]]
                
                if face.size > 0:
                    # Simuler la détection d'émotions (dans un vrai cas, utilisez un modèle d'IA)
                    # Ici, nous utilisons une détection aléatoire pour la démonstration
                    emotion_idx = np.random.randint(0, 7)
                    emotion = self.emotions[emotion_idx]
                    self.emotion_counts[emotion] += 1
                    self.frame_count += 1
                    
                    # Affichage de l'émotion sur l'image
                    cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[0]+bbox[2], bbox[1]+bbox[3]), (0, 255, 0), 2)
                    cv2.putText(img, emotion, (bbox[0], bbox[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
        return img
    
    def get_emotion_stats(self):
        if self.frame_count == 0:
            return {emotion: 0 for emotion in self.emotions.values()}
        
        return {emotion: count / self.frame_count for emotion, count in self.emotion_counts.items()}

# Fonction pour générer des questions d'entretien basées sur le CV et la description de poste
def generate_interview_questions(cv_text, job_description, models):
    nlp = models["nlp"]
    
    # Analyse du CV et de la description de poste
    cv_doc = nlp(cv_text)
    job_doc = nlp(job_description)
    
    # Extraction des compétences et expériences clés
    cv_skills = [ent.text for ent in cv_doc.ents if ent.label_ in ["SKILL", "ORG", "PRODUCT"]]
    job_skills = [ent.text for ent in job_doc.ents if ent.label_ in ["SKILL", "ORG", "PRODUCT"]]
    
    # Génération de questions basées sur les compétences requises
    questions = [
        f"Pouvez-vous décrire votre expérience avec {skill}?" for skill in job_skills[:2]
    ]
    
    # Questions générales
    general_questions = [
        "Décrivez une situation difficile que vous avez rencontrée dans votre travail précédent et comment vous l'avez résolue.",
        "Quelles sont vos principales forces et faiblesses professionnelles?",
        "Pourquoi êtes-vous intéressé par ce poste?",
        "Où vous voyez-vous dans 5 ans?"
    ]
    
    # Combiner les questions spécifiques et générales
    all_questions = questions + general_questions
    
    # Limiter à 4 questions maximum
    return all_questions[:4]

# Fonction pour évaluer les réponses de l'entretien écrit
def evaluate_written_answers(questions, answers, models):
    tokenizer = models["tokenizer"]
    model = models["model"]
    
    scores = []
    
    for q, a in zip(questions, answers):
        # Vérifier la longueur de la réponse
        if len(a.split()) < 10:
            scores.append(0.3)  # Réponse trop courte
            continue
            
        # Encodage de la question et de la réponse
        q_inputs = tokenizer(q, return_tensors="pt", truncation=True, max_length=512, padding=True)
        a_inputs = tokenizer(a, return_tensors="pt", truncation=True, max_length=512, padding=True)
        
        with torch.no_grad():
            q_outputs = model(**q_inputs)
            a_outputs = model(**a_inputs)
        
        q_embeddings = q_outputs.last_hidden_state.mean(dim=1)
        a_embeddings = a_outputs.last_hidden_state.mean(dim=1)
        
        # Calcul de la similarité cosinus
        similarity = cosine_similarity(
            q_embeddings.detach().numpy(),
            a_embeddings.detach().numpy()
        )[0][0]
        
        # Normalisation du score (0-1)
        score = (similarity + 1) / 2
        scores.append(score)
    
    # Score moyen sur 100
    return sum(scores) / len(scores) * 100 if scores else 0

# Fonction pour vérifier l'authenticité des documents
def verify_document_authenticity(document_path, document_type, models):
    try:
        # Chargement de l'image du document
        image = cv2.imread(document_path)
        if image is None:
            return 0.0
            
        # Extraction du texte avec OCR
        text = pytesseract.image_to_string(image, lang='fra')
        
        # Analyse de la mise en page avec LayoutParser
        layout_model = models["document_model"]
        layout = layout_model.detect(image)
        
        # Vérification basée sur le type de document
        authenticity_score = 0.0
        
        if document_type == "CIN":
            # Vérifier la présence d'éléments typiques d'une CIN
            if re.search(r"CARTE NATIONALE D'IDENTITÉ|RÉPUBLIQUE FRANÇAISE", text, re.IGNORECASE):
                authenticity_score += 0.3
            if re.search(r"\d{12}|\d{4} \d{4} \d{4}", text):  # Numéro de CIN
                authenticity_score += 0.3
            if re.search(r"\d{2}/\d{2}/\d{4}", text):  # Date de naissance
                authenticity_score += 0.2
            if len(layout) >= 3:  # Au moins 3 blocs (photo, texte, signature)
                authenticity_score += 0.2
                
        elif document_type == "Diplôme":
            # Vérifier la présence d'éléments typiques d'un diplôme
            if re.search(r"DIPLÔME|UNIVERSITÉ|ÉCOLE|MASTER|LICENCE|BAC", text, re.IGNORECASE):
                authenticity_score += 0.3
            if re.search(r"DÉLIVRÉ À|OBTENU PAR|DÉCERNÉ À", text, re.IGNORECASE):
                authenticity_score += 0.2
            if re.search(r"\d{2}/\d{2}/\d{4}|\d{4}", text):  # Date
                authenticity_score += 0.2
            if re.search(r"SIGNATURE|DIRECTEUR|PRÉSIDENT", text, re.IGNORECASE):
                authenticity_score += 0.3
                
        elif document_type == "Passeport":
            # Vérifier la présence d'éléments typiques d'un passeport
            if re.search(r"PASSEPORT|PASSPORT", text, re.IGNORECASE):
                authenticity_score += 0.3
            if re.search(r"[A-Z]{2}\d{7}|\d{9}", text):  # Numéro de passeport
                authenticity_score += 0.3
            if re.search(r"\d{2}/\d{2}/\d{4}", text):  # Date
                authenticity_score += 0.2
            if len(layout) >= 4:  # Au moins 4 blocs (photo, données, signature, MRZ)
                authenticity_score += 0.2
                
        elif document_type == "Permis de conduire":
            # Vérifier la présence d'éléments typiques d'un permis de conduire
            if re.search(r"PERMIS DE CONDUIRE|DRIVING LICENCE", text, re.IGNORECASE):
                authenticity_score += 0.3
            if re.search(r"CATÉGORIE|CATEGORY", text, re.IGNORECASE):
                authenticity_score += 0.2
            if re.search(r"\d{2}/\d{2}/\d{4}", text):  # Date
                authenticity_score += 0.2
            if re.search(r"[A-Z]{2}\d{2}|[A-Z]\d{2}", text):  # Numéro de permis
                authenticity_score += 0.3
        
        else:
            # Document générique
            authenticity_score = 0.5  # Score par défaut
            
        return min(authenticity_score, 1.0) * 100
        
    except Exception as e:
        st.error(f"Erreur lors de la vérification du document: {e}")
        return 0.0

# Interface principale
def main():
    # Initialisation de la base de données
    init_db()
    
    # Chargement des modèles NLP
    models = load_nlp_models()
    
    # Sidebar pour la navigation
    st.sidebar.title("ATS Intelligent")
    page = st.sidebar.selectbox(
        "Navigation",
        ["Accueil", "Ajouter une offre d'emploi", "Postuler", "Tableau de bord"]
    )
    
    # Page d'accueil
    if page == "Accueil":
        st.title("Plateforme Intelligente de Recrutement")
        st.subheader("Bienvenue sur notre système ATS basé sur l'IA")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.info("""
            ### Fonctionnalités principales:
            - 🔍 Matching CV-Poste avec IA
            - 💬 Entretien écrit automatisé
            - 🎥 Entretien vidéo avec analyse des émotions
            - 🗂️ Vérification d'authenticité des documents
            - 📊 Tableau de bord complet
            """)
        
        with col2:
            st.success("""
            ### Comment ça marche:
            1. Les recruteurs ajoutent des offres d'emploi
            2. Les candidats postulent avec leur CV
            3. L'IA analyse la compatibilité
            4. Les candidats compatibles passent des entretiens automatisés
            5. Les documents sont vérifiés
            6. Les recruteurs consultent les résultats dans le tableau de bord
            """)
    
    # Page pour ajouter une offre d'emploi
    elif page == "Ajouter une offre d'emploi":
        st.title("Ajouter une nouvelle offre d'emploi")
        
        with st.form("job_form"):
            job_title = st.text_input("Titre du poste")
            job_description = st.text_area("Description du poste", height=200)
            required_skills = st.text_area("Compétences requises (séparées par des virgules)")
            required_experience = st.number_input("Expérience requise (années)", min_value=0, max_value=20)
            
            submit_button = st.form_submit_button("Ajouter l'offre")
            
            if submit_button:
                if job_title and job_description:
                    conn = sqlite3.connect('ats_database.db')
                    c = conn.cursor()
                    c.execute(
                        "INSERT INTO jobs (title, description, required_skills, required_experience) VALUES (?, ?, ?, ?)",
                        (job_title, job_description, required_skills, required_experience)
                    )
                    conn.commit()
                    conn.close()
                    st.success("Offre d'emploi ajoutée avec succès!")
                else:
                    st.error("Veuillez remplir tous les champs obligatoires.")
        
        # Afficher les offres existantes
        st.subheader("Offres d'emploi existantes")
        conn = sqlite3.connect('ats_database.db')
        jobs_df = pd.read_sql_query("SELECT id, title, required_experience, created_at FROM jobs ORDER BY created_at DESC", conn)
        conn.close()
        
        if not jobs_df.empty:
            st.dataframe(jobs_df)
        else:
            st.info("Aucune offre d'emploi n'a été ajoutée.")
    
    # Page pour postuler
    elif page == "Postuler":
        st.title("Postuler à une offre d'emploi")
        
        # Sélection de l'offre d'emploi
        conn = sqlite3.connect('ats_database.db')
        jobs_df = pd.read_sql_query("SELECT id, title FROM jobs", conn)
        conn.close()
        
        if jobs_df.empty:
            st.warning("Aucune offre d'emploi disponible. Veuillez demander au recruteur d'ajouter des offres.")
            return
            
        job_id = st.selectbox("Sélectionnez une offre d'emploi", jobs_df["id"].tolist(), format_func=lambda x: jobs_df[jobs_df["id"] == x]["title"].iloc[0])
        
        # Récupération de la description du poste
        conn = sqlite3.connect('ats_database.db')
        c = conn.cursor()
        c.execute("SELECT description FROM jobs WHERE id = ?", (job_id,))
        job_description = c.fetchone()[0]
        conn.close()
        
        # Formulaire de candidature
        with st.form("application_form"):
            name = st.text_input("Nom complet")
            email = st.text_input("Email")
            phone = st.text_input("Téléphone")
            
            cv_file = st.file_uploader("Télécharger votre CV (PDF ou Word)", type=["pdf", "docx"])
            
            submit_button = st.form_submit_button("Postuler")
            
            if submit_button:
                if name and email and cv_file:
                    # Sauvegarde du CV
                    cv_path = f"uploads/cv_{int(time.time())}_{cv_file.name}"
                    os.makedirs(os.path.dirname(cv_path), exist_ok=True)
                    
                    with open(cv_path, "wb") as f:
                        f.write(cv_file.getbuffer())
                    
                    # Extraction du texte du CV
                    if cv_file.name.endswith('.pdf'):
                        cv_text = extract_text_from_pdf(cv_file)
                    elif cv_file.name.endswith('.docx'):
                        cv_text = extract_text_from_docx(cv_file)
                    else:
                        st.error("Format de fichier non supporté.")
                        return
                    
                    # Calcul du score de matching
                    matching_score = calculate_matching_score(cv_text, job_description, models)
                    
                    # Enregistrement du candidat dans la base de données
                    conn = sqlite3.connect('ats_database.db')
                    c = conn.cursor()
                    c.execute(
                        "INSERT INTO candidates (name, email, phone, cv_path, job_id, cv_match_score, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (name, email, phone, cv_path, job_id, matching_score, "En attente")
                    )
                    candidate_id = c.lastrowid
                    conn.commit()
                    conn.close()
                    
                    st.success("Candidature soumise avec succès!")
                    
                    # Affichage du score de matching
                    st.metric("Score de compatibilité CV-Poste", f"{matching_score:.1f}/100")
                    
                    if matching_score >= 70:
                        st.success("Félicitations! Votre profil correspond bien à cette offre d'emploi.")
                        
                        # Passage à l'étape suivante: entretien écrit
                        st.subheader("Entretien écrit automatisé")
                        st.info("Veuillez répondre aux questions suivantes pour continuer le processus de recrutement.")
                        
                        # Génération des questions d'entretien
                        questions = generate_interview_questions(cv_text, job_description, models)
                        
                        answers = []
                        for i, question in enumerate(questions):
                            answer = st.text_area(f"Question {i+1}: {question}", key=f"q{i}")
                            answers.append(answer)
                        
                        if st.button("Soumettre les réponses"):
                            if all(answers):
                                # Évaluation des réponses
                                written_score = evaluate_written_answers(questions, answers, models)
                                
                                # Mise à jour du score dans la base de données
                                conn = sqlite3.connect('ats_database.db')
                                c = conn.cursor()
                                c.execute(
                                    "UPDATE candidates SET written_interview_score = ? WHERE id = ?",
                                    (written_score, candidate_id)
                                )
                                
                                # Enregistrement des questions et réponses
                                c.execute(
                                    "INSERT INTO interviews (candidate_id, job_id, questions, answers, written_score) VALUES (?, ?, ?, ?, ?)",
                                    (candidate_id, job_id, str(questions), str(answers), written_score)
                                )
                                conn.commit()
                                conn.close()
                                
                                st.metric("Score de l'entretien écrit", f"{written_score:.1f}/100")
                                
                                if written_score >= 60:
                                    st.success("Vous avez réussi l'entretien écrit!")
                                    
                                    # Passage à l'étape suivante: entretien vidéo
                                    st.subheader("Entretien vidéo avec analyse des émotions")
                                    st.info("Veuillez activer votre caméra et répondre aux questions qui s'afficheront.")
                                    
                                    # Affichage des questions pour l'entretien vidéo
                                    video_questions = [
                                        "Présentez-vous en quelques mots.",
                                        "Pourquoi êtes-vous intéressé par ce poste?",
                                        "Quelle est votre plus grande réussite professionnelle?",
                                        "Comment gérez-vous le stress au travail?"
                                    ]
                                    
                                    for i, question in enumerate(video_questions):
                                        st.write(f"**Question {i+1}:** {question}")
                                    
                                    # Interface de webcam avec détection d'émotions
                                    emotion_detector = EmotionDetector()
                                    webrtc_ctx = webrtc_streamer(
                                        key="emotion-detection",
                                        video_transformer_factory=lambda: emotion_detector,
                                        async_transform=True
                                    )
                                    
                                    if st.button("Terminer l'entretien vidéo"):
                                        # Récupération des statistiques d'émotions
                                        emotion_stats = emotion_detector.get_emotion_stats()
                                        
                                        # Calcul du score vidéo
                                        # Formule: plus de joie et neutre = meilleur score
                                        video_score = (
                                            emotion_stats.get("Joie", 0) * 0.4 +
                                            emotion_stats.get("Neutre", 0) * 0.3 +
                                            emotion_stats.get("Surprise", 0) * 0.1 +
                                            (1 - emotion_stats.get("Colère", 0)) * 0.1 +
                                            (1 - emotion_stats.get("Tristesse", 0)) * 0.05 +
                                            (1 - emotion_stats.get("Peur", 0)) * 0.05
                                        ) * 100
                                        
                                        # Mise à jour du score dans la base de données
                                        conn = sqlite3.connect('ats_database.db')
                                        c = conn.cursor()
                                        c.execute(
                                            "UPDATE candidates SET video_interview_score = ? WHERE id = ?",
                                            (video_score, candidate_id)
                                        )
                                        
                                        # Mise à jour des données d'entretien
                                        c.execute(
                                            "UPDATE interviews SET video_score = ?, emotions_data = ? WHERE candidate_id = ?",
                                            (video_score, str(emotion_stats), candidate_id)
                                        )
                                        conn.commit()
                                        conn.close()
                                        
                                        st.metric("Score de l'entretien vidéo", f"{video_score:.1f}/100")
                                        
                                        # Calcul du score moyen des entretiens
                                        avg_interview_score = (written_score + video_score) / 2
                                        
                                        if avg_interview_score >= 65:
                                            st.success("Félicitations! Vous avez réussi les entretiens.")
                                            
                                            # Passage à l'étape suivante: vérification des documents
                                            st.subheader("Vérification des documents")
                                            st.info("Veuillez télécharger vos documents officiels pour vérification.")
                                            
                                            document_types = ["CIN", "Diplôme de bac", "Diplôme de master", "Passeport", "Permis de conduire"]
                                            uploaded_docs = {}
                                            
                                            for doc_type in document_types:
                                                doc_file = st.file_uploader(f"Télécharger votre {doc_type}", type=["jpg", "jpeg", "png", "pdf"], key=doc_type)
                                                if doc_file:
                                                    uploaded_docs[doc_type] = doc_file
                                            
                                            if st.button("Soumettre les documents"):
                                                if uploaded_docs:
                                                    total_auth_score = 0
                                                    
                                                    for doc_type, doc_file in uploaded_docs.items():
                                                        # Sauvegarde du document
                                                        doc_path = f"uploads/docs_{int(time.time())}_{doc_file.name}"
                                                        os.makedirs(os.path.dirname(doc_path), exist_ok=True)
                                                        
                                                        with open(doc_path, "wb") as f:
                                                            f.write(doc_file.getbuffer())
                                                        
                                                        # Vérification de l'authenticité
                                                        auth_score = verify_document_authenticity(doc_path, doc_type.split()[0], models)
                                                        
                                                        # Enregistrement du document dans la base de données
                                                        conn = sqlite3.connect('ats_database.db')
                                                        c = conn.cursor()
                                                        c.execute(
                                                            "INSERT INTO documents (candidate_id, document_type, document_path, authenticity_score, verified) VALUES (?, ?, ?, ?, ?)",
                                                            (candidate_id, doc_type, doc_path, auth_score, auth_score >= 70)
                                                        )
                                                        conn.commit()
                                                        conn.close()
                                                        
                                                        total_auth_score += auth_score
                                                        
                                                        st.write(f"{doc_type}: Score d'authenticité {auth_score:.1f}/100")
                                                    
                                                    # Calcul du score moyen d'authenticité
                                                    avg_auth_score = total_auth_score / len(uploaded_docs)
                                                    
                                                    # Mise à jour du score dans la base de données
                                                    conn = sqlite3.connect('ats_database.db')
                                                    c = conn.cursor()
                                                    c.execute(
                                                        "UPDATE candidates SET documents_score = ? WHERE id = ?",
                                                        (avg_auth_score, candidate_id)
                                                    )
                                                    
                                                    # Calcul du score final
                                                    c.execute(
                                                        "SELECT cv_match_score, written_interview_score, video_interview_score, documents_score FROM candidates WHERE id = ?",
                                                        (candidate_id,)
                                                    )
                                                    scores = c.fetchone()
                                                    
                                                    final_score = (
                                                        scores[0] * 0.3 +  # CV match
                                                        scores[1] * 0.25 +  # Written interview
                                                        scores[2] * 0.25 +  # Video interview
                                                        scores[3] * 0.2  # Documents
                                                    )
                                                    
                                                    # Mise à jour du statut et du score final
                                                    status = "Présélectionné" if final_score >= 70 else "Rejeté"
                                                    c.execute(
                                                        "UPDATE candidates SET final_score = ?, status = ? WHERE id = ?",
                                                        (final_score, status, candidate_id)
                                                    )
                                                    conn.commit()
                                                    conn.close()
                                                    
                                                    st.metric("Score final", f"{final_score:.1f}/100")
                                                    
                                                    if final_score >= 70:
                                                        st.success("Félicitations! Votre candidature a été présélectionnée.")
                                                        st.balloons()
                                                    else:
                                                        st.error("Nous sommes désolés, mais votre candidature n'a pas été retenue.")
                                                else:
                                                    st.warning("Veuillez télécharger au moins un document.")
                                        else:
                                            st.error("Nous sommes désolés, mais vous n'avez pas obtenu un score suffisant aux entretiens.")
                                else:
                                    st.error("Nous sommes désolés, mais vous n'avez pas obtenu un score suffisant à l'entretien écrit.")
                            else:
                                st.warning("Veuillez répondre à toutes les questions.")
                    else:
                        st.error("Nous sommes désolés, mais votre profil ne correspond pas suffisamment à cette offre d'emploi.")
                else:
                    st.warning("Veuillez remplir tous les champs obligatoires.")
    
    # Page du tableau de bord
    elif page == "Tableau de bord":
        st.title("Tableau de bord de recrutement")
        
        # Filtres
        col1, col2 = st.columns(2)
        
        with col1:
            conn = sqlite3.connect('ats_database.db')
            jobs_df = pd.read_sql_query("SELECT id, title FROM jobs", conn)
            conn.close()
            
            if not jobs_df.empty:
                job_filter = st.selectbox(
                    "Filtrer par offre d'emploi",
                    ["Toutes les offres"] + jobs_df["id"].tolist(),
                    format_func=lambda x: "Toutes les offres" if x == "Toutes les offres" else jobs_df[jobs_df["id"] == x]["title"].iloc[0]
                )
            else:
                job_filter = "Toutes les offres"
        
        with col2:
            status_filter = st.selectbox(
                "Filtrer par statut",
                ["Tous les statuts", "En attente", "Présélectionné", "Rejeté"]
            )
        
        # Construction de la requête SQL avec filtres
        query = "SELECT * FROM candidates"
        params = []
        
        if job_filter != "Toutes les offres" or status_filter != "Tous les statuts":
            query += " WHERE"
            
            if job_filter != "Toutes les offres":
                query += " job_id = ?"
                params.append(job_filter)
                
                if status_filter != "Tous les statuts":
                    query += " AND status = ?"
                    params.append(status_filter)
            elif status_filter != "Tous les statuts":
                query += " status = ?"
                params.append(status_filter)
        
        # Récupération des données
        conn = sqlite3.connect('ats_database.db')
        candidates_df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        if not candidates_df.empty:
            # Ajout du nom de l'offre d'emploi
            conn = sqlite3.connect('ats_database.db')
            jobs_df = pd.read_sql_query("SELECT id, title FROM jobs", conn)
            conn.close()
            
            candidates_df = candidates_df.merge(jobs_df, left_on="job_id", right_on="id", suffixes=("", "_job"))
            candidates_df.rename(columns={"title": "job_title"}, inplace=True)
            
            # Affichage des statistiques
            st.subheader("Statistiques")
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total des candidats", len(candidates_df))
            
            with col2:
                preselected = len(candidates_df[candidates_df["status"] == "Présélectionné"])
                st.metric("Candidats présélectionnés", preselected)
            
            with col3:
                rejected = len(candidates_df[candidates_df["status"] == "Rejeté"])
                st.metric("Candidats rejetés", rejected)
            
            with col4:
                pending = len(candidates_df[candidates_df["status"] == "En attente"])
                st.metric("Candidats en attente", pending)
            
            # Graphiques
            st.subheader("Analyse des candidatures")
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Distribution des scores finaux
                fig, ax = plt.subplots(figsize=(8, 5))
                candidates_df["final_score"].fillna(0).hist(bins=10, ax=ax)
                ax.set_title("Distribution des scores finaux")
                ax.set_xlabel("Score")
                ax.set_ylabel("Nombre de candidats")
                st.pyplot(fig)
            
            with col2:
                # Répartition des statuts
                status_counts = candidates_df["status"].value_counts()
                fig, ax = plt.subplots(figsize=(8, 5))
                ax.pie(status_counts, labels=status_counts.index, autopct='%1.1f%%')
                ax.set_title("Répartition des statuts")
                st.pyplot(fig)
            
            # Tableau des candidats
            st.subheader("Liste des candidats")
            
            # Sélection et renommage des colonnes à afficher
            display_df = candidates_df[[
                "id", "name", "email", "job_title", "cv_match_score",
                "written_interview_score", "video_interview_score",
                "documents_score", "final_score", "status"
            ]].copy()
            
            display_df.columns = [
                "ID", "Nom", "Email", "Poste", "Score CV",
                "Score Entretien Écrit", "Score Entretien Vidéo",
                "Score Documents", "Score Final", "Statut"
            ]
            
            # Remplacement des valeurs NaN par des tirets
            display_df = display_df.fillna("-")
            
            # Affichage du tableau
            st.dataframe(display_df)
            
            # Détails d'un candidat
            st.subheader("Détails d'un candidat")
            
            selected_candidate = st.selectbox(
                "Sélectionner un candidat",
                candidates_df["id"].tolist(),
                format_func=lambda x: candidates_df[candidates_df["id"] == x]["name"].iloc[0]
            )
            
            if selected_candidate:
                candidate = candidates_df[candidates_df["id"] == selected_candidate].iloc[0]
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.write(f"**Nom:** {candidate['name']}")
                    st.write(f"**Email:** {candidate['email']}")
                    st.write(f"**Téléphone:** {candidate['phone']}")
                    st.write(f"**Poste:** {candidate['job_title']}")
                    st.write(f"**Statut:** {candidate['status']}")
                
                with col2:
                    st.metric("Score CV", f"{candidate['cv_match_score']:.1f}/100" if pd.notna(candidate['cv_match_score']) else "-")
                    st.metric("Score Entretien Écrit", f"{candidate['written_interview_score']:.1f}/100" if pd.notna(candidate['written_interview_score']) else "-")
                    st.metric("Score Entretien Vidéo", f"{candidate['video_interview_score']:.1f}/100" if pd.notna(candidate['video_interview_score']) else "-")
                    st.metric("Score Documents", f"{candidate['documents_score']:.1f}/100" if pd.notna(candidate['documents_score']) else "-")
                    st.metric("Score Final", f"{candidate['final_score']:.1f}/100" if pd.notna(candidate['final_score']) else "-")
                
                # Récupération des entretiens
                conn = sqlite3.connect('ats_database.db')
                interviews_df = pd.read_sql_query(
                    "SELECT * FROM interviews WHERE candidate_id = ?",
                    conn,
                    params=(selected_candidate,)
                )
                conn.close()
                
                if not interviews_df.empty:
                    st.subheader("Détails de l'entretien")
                    
                    interview = interviews_df.iloc[0]
                    
                    # Affichage des questions et réponses
                    try:
                        questions = eval(interview["questions"])
                        answers = eval(interview["answers"])
                        
                        for q, a in zip(questions, answers):
                            st.write(f"**Q:** {q}")
                            st.write(f"**R:** {a}")
                            st.write("---")
                    except:
                        st.write("Impossible d'afficher les questions et réponses.")
                    
                    # Affichage des émotions si disponibles
                    if pd.notna(interview["emotions_data"]):
                        try:
                            emotions_data = eval(interview["emotions_data"])
                            
                            st.subheader("Analyse des émotions")
                            
                            # Graphique des émotions
                            fig, ax = plt.subplots(figsize=(8, 5))
                            emotions = list(emotions_data.keys())
                            values = list(emotions_data.values())
                            
                            ax.bar(emotions, values)
                            ax.set_title("Répartition des émotions pendant l'entretien vidéo")
                            ax.set_ylabel("Proportion")
                            plt.xticks(rotation=45)
                            st.pyplot(fig)
                        except:
                            st.write("Impossible d'afficher l'analyse des émotions.")
                
                # Récupération des documents
                conn = sqlite3.connect('ats_database.db')
                documents_df = pd.read_sql_query(
                    "SELECT * FROM documents WHERE candidate_id = ?",
                    conn,
                    params=(selected_candidate,)
                )
                conn.close()
                
                if not documents_df.empty:
                    st.subheader("Documents soumis")
                    
                    for _, doc in documents_df.iterrows():
                        col1, col2 = st.columns([1, 3])
                        
                        with col1:
                            st.write(f"**Type:** {doc['document_type']}")
                            st.write(f"**Score:** {doc['authenticity_score']:.1f}/100")
                            st.write(f"**Vérifié:** {'Oui' if doc['verified'] else 'Non'}")
                        
                        with col2:
                            try:
                                if os.path.exists(doc['document_path']):
                                    image = Image.open(doc['document_path'])
                                    st.image(image, width=300, caption=doc['document_type'])
                            except:
                                st.write("Impossible d'afficher l'image du document.")
        else:
            st.info("Aucun candidat ne correspond aux critères de filtrage.")

if __name__ == "__main__":
    main()
