# Plateforme Intelligente de Recrutement (ATS)

Cette application est une plateforme intelligente de recrutement (ATS) qui utilise l'IA pour automatiser et optimiser le processus de recrutement.

## Fonctionnalités

1. **Matching CV-Poste**
   - Analyse de compatibilité entre CV et description de poste
   - Score de matching sur 100

2. **Entretien écrit automatisé**
   - Questions générées automatiquement basées sur le CV et le poste
   - Évaluation des réponses par IA

3. **Entretien vidéo avec analyse des émotions**
   - Détection des émotions faciales pendant l'entretien
   - Évaluation comportementale

4. **Vérification des documents**
   - Classification automatique des documents (CIN, diplômes, etc.)
   - Vérification d'authenticité

5. **Tableau de bord complet**
   - Statistiques et visualisations
   - Détails des candidats et de leurs évaluations

## Installation

1. Cloner ce dépôt
2. Installer les dépendances:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
3. Installer les modèles spaCy:
   \`\`\`
   python -m spacy download fr_core_news_md
   \`\`\`
4. Installer Tesseract OCR pour l'OCR:
   - Sur Windows: Télécharger depuis https://github.com/UB-Mannheim/tesseract/wiki
   - Sur Linux: `sudo apt-get install tesseract-ocr`
   - Sur macOS: `brew install tesseract`

## Utilisation

1. Lancer l'application:
   \`\`\`
   streamlit run app.py
   \`\`\`
2. Accéder à l'application via votre navigateur à l'adresse: http://localhost:8501

## Structure du projet

- `app.py`: Application principale Streamlit
- `uploads/`: Dossier pour stocker les CV et documents téléchargés
- `ats_database.db`: Base de données SQLite

## Dépendances principales

- Streamlit: Interface utilisateur
- spaCy: Traitement du langage naturel
- Transformers: Modèles d'IA pour l'analyse sémantique
- OpenCV et MediaPipe: Détection des émotions faciales
- LayoutParser: Analyse de mise en page des documents
- PyTesseract: OCR pour l'extraction de texte des documents
