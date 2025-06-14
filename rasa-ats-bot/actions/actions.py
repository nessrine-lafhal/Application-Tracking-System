import sys
import os
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.forms import FormValidationAction
from rasa_sdk.events import SlotSet, FollowupAction
import json
import re
import random

class ATSSystem:
    """Version simplifiée du système ATS pour l'intégration Rasa"""
    def __init__(self):
        pass
    
    def analyze_cv_job_match(self, cv_text: str, job_text: str) -> Dict[str, Any]:
        """Analyse simplifiée CV/Job matching"""
        # Extraction de compétences basique
        tech_skills = self.extract_tech_skills(cv_text)
        job_requirements = self.extract_tech_skills(job_text)
        
        # Score de matching simplifié
        matching_skills = set(tech_skills).intersection(set(job_requirements))
        skill_match_score = len(matching_skills) / max(len(job_requirements), 1) * 100
        
        # Analyse d'expérience
        experience_match = self.analyze_experience_match(cv_text, job_text)
        
        return {
            "skill_match_score": skill_match_score,
            "experience_match": experience_match,
            "matching_skills": list(matching_skills),
            "missing_skills": list(set(job_requirements) - set(tech_skills)),
            "cv_skills": tech_skills,
            "job_requirements": job_requirements
        }
    
    def extract_tech_skills(self, text: str) -> List[str]:
        """Extraction basique de compétences techniques"""
        skills_patterns = [
            r'\b(?:Python|Java|JavaScript|React|Angular|Vue|Node\.js|Django|Flask|SQL|MongoDB|PostgreSQL|MySQL|Docker|Kubernetes|AWS|Azure|GCP|Git|Linux)\b'
        ]
        
        skills = []
        for pattern in skills_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend([match.lower() for match in matches])
        
        return list(set(skills))
    
    def analyze_experience_match(self, cv_text: str, job_text: str) -> float:
        """Analyse de correspondance d'expérience"""
        # Extraction d'années d'expérience
        cv_exp = self.extract_years_experience(cv_text)
        job_exp = self.extract_years_experience(job_text)
        
        if job_exp == 0:
            return 100.0
        
        return min(cv_exp / job_exp * 100, 100.0)
    
    def extract_years_experience(self, text: str) -> int:
        """Extraction du nombre d'années d'expérience"""
        patterns = [
            r'(\d+)\s*(?:ans?|years?)\s*(?:d[\'e]expérience|experience)',
            r'(\d+)\+?\s*(?:ans?|years?)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return max([int(match) for match in matches])
        
        return 0

class ActionAnalyzeDocuments(Action):
    """Analyse des documents CV et offre d'emploi"""
    
    def name(self) -> Text:
        return "action_analyze_documents"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        cv_text = tracker.get_slot("cv_text")
        job_offer_text = tracker.get_slot("job_offer_text")
        
        if not cv_text or not job_offer_text:
            dispatcher.utter_message(text="Erreur: CV ou offre d'emploi manquant.")
            return []
        
        # Initialisation du système ATS
        ats_system = ATSSystem()
        analysis = ats_system.analyze_cv_job_match(cv_text, job_offer_text)
        
        # Stockage de l'analyse
        return [SlotSet("ats_score", analysis["skill_match_score"])]

class ActionGenerateQuestions(Action):
    """Génération de questions personnalisées basées sur l'analyse"""
    
    def name(self) -> Text:
        return "action_generate_questions"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        cv_text = tracker.get_slot("cv_text") or ""
        job_offer_text = tracker.get_slot("job_offer_text") or ""
        
        # Génération de questions personnalisées
        questions = self.generate_personalized_questions(cv_text, job_offer_text)
        
        return [SlotSet("question_answers", {"questions": questions, "current_index": 0, "answers": []})]
    
    def generate_personalized_questions(self, cv_text: str, job_text: str) -> List[Dict[str, str]]:
        """Génère des questions basées sur l'analyse CV/Job"""
        
        questions = []
        
        # Questions sur les compétences techniques
        ats_system = ATSSystem()
        cv_skills = ats_system.extract_tech_skills(cv_text)
        job_skills = ats_system.extract_tech_skills(job_text)
        missing_skills = set(job_skills) - set(cv_skills)
        
        if missing_skills:
            skill = list(missing_skills)[0]
            questions.append({
                "question": f"L'offre d'emploi mentionne {skill}. Avez-vous de l'expérience avec cette technologie ?",
                "type": "technical_skill",
                "skill": skill,
                "weight": 3
            })
        
        # Questions sur l'expérience
        cv_exp = ats_system.extract_years_experience(cv_text)
        job_exp = ats_system.extract_years_experience(job_text)
        
        if job_exp > cv_exp:
            questions.append({
                "question": f"L'offre demande {job_exp} ans d'expérience. Comment comptez-vous compenser cette différence ?",
                "type": "experience_gap",
                "weight": 4
            })
        
        # Questions générales sur la motivation
        questions.extend([
            {
                "question": "Qu'est-ce qui vous motive le plus dans ce poste ?",
                "type": "motivation",
                "weight": 2
            },
            {
                "question": "Comment gérez-vous le travail sous pression ?",
                "type": "soft_skills",
                "weight": 2
            },
            {
                "question": "Décrivez un projet dont vous êtes particulièrement fier.",
                "type": "achievement",
                "weight": 3
            }
        ])
        
        return questions[:5]  # Limiter à 5 questions

class ActionAskNextQuestion(Action):
    """Pose la prochaine question"""
    
    def name(self) -> Text:
        return "action_ask_next_question"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        qa_data = tracker.get_slot("question_answers")
        
        if not qa_data or "questions" not in qa_data:
            dispatcher.utter_message(text="Erreur: Pas de questions générées.")
            return [FollowupAction("action_calculate_final_score")]
        
        current_index = qa_data.get("current_index", 0)
        questions = qa_data["questions"]
        
        if current_index >= len(questions):
            return [FollowupAction("action_calculate_final_score")]
        
        current_question = questions[current_index]
        dispatcher.utter_message(text=f"Question {current_index + 1}/{len(questions)}: {current_question['question']}")
        
        return [SlotSet("current_question", current_question)]

class ActionProcessAnswer(Action):
    """Traite la réponse de l'utilisateur"""
    
    def name(self) -> Text:
        return "action_process_answer"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_message = tracker.latest_message.get("text", "")
        qa_data = tracker.get_slot("question_answers")
        current_question = tracker.get_slot("current_question")
        
        if not qa_data or not current_question:
            return []
        
        # Analyse de la réponse
        answer_score = self.analyze_answer(user_message, current_question)
        
        # Mise à jour des données
        qa_data["answers"].append({
            "question": current_question,
            "answer": user_message,
            "score": answer_score
        })
        qa_data["current_index"] += 1
        
        return [
            SlotSet("question_answers", qa_data),
            FollowupAction("action_ask_next_question")
        ]
    
    def analyze_answer(self, answer: str, question: Dict[str, str]) -> float:
        """Analyse la qualité de la réponse"""
        base_score = 5.0  # Score de base
        
        # Facteurs positifs
        if len(answer) > 50:  # Réponse détaillée
            base_score += 2.0
        
        if question["type"] == "technical_skill":
            if any(word in answer.lower() for word in ["oui", "expérience", "projet", "utilisé", "maîtrise"]):
                base_score += 3.0
            elif any(word in answer.lower() for word in ["non", "jamais", "pas"]):
                base_score -= 2.0
        
        # Mots-clés positifs généraux
        positive_keywords = ["passionné", "motivé", "challenge", "apprendre", "équipe", "innovation"]
        if any(keyword in answer.lower() for keyword in positive_keywords):
            base_score += 1.0
        
        return min(base_score, 10.0)  # Score max de 10

class ActionCalculateFinalScore(Action):
    """Calcule le score final et fournit le feedback"""
    
    def name(self) -> Text:
        return "action_calculate_final_score"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        ats_score = tracker.get_slot("ats_score") or 0
        qa_data = tracker.get_slot("question_answers") or {}
        
        # Calcul du score d'entretien
        interview_score = 0
        if "answers" in qa_data:
            answers = qa_data["answers"]
            if answers:
                total_weighted_score = sum(answer["score"] * answer["question"]["weight"] 
                                         for answer in answers)
                total_weight = sum(answer["question"]["weight"] for answer in answers)
                interview_score = (total_weighted_score / total_weight) * 10 if total_weight > 0 else 0
        
        # Score final combiné (60% ATS + 40% Entretien)
        final_score = (ats_score * 0.6 + interview_score * 4 * 0.4)
        
        # Génération du feedback
        feedback = self.generate_feedback(ats_score, interview_score, final_score, qa_data)
        
        dispatcher.utter_message(text=feedback)
        
        return [
            SlotSet("interview_score", interview_score),
            SlotSet("final_score", final_score)
        ]
    
    def generate_feedback(self, ats_score: float, interview_score: float, 
                         final_score: float, qa_data: Dict) -> str:
        """Génère un feedback détaillé"""
        
        feedback = f"""
🎯 **ÉVALUATION COMPLÈTE**

📊 **Scores détaillés:**
• Score ATS (CV vs Offre): {ats_score:.1f}/100
• Score Entretien: {interview_score:.1f}/10
• **Score Final: {final_score:.1f}/100**

"""
        
        # Évaluation qualitative
        if final_score >= 80:
            feedback += "🟢 **Excellent profil !** Vous êtes un candidat très prometteur.\n"
        elif final_score >= 60:
            feedback += "🟡 **Bon profil** avec quelques points à améliorer.\n"
        else:
            feedback += "🔴 **Profil à développer** - Plusieurs axes d'amélioration identifiés.\n"
        
        # Recommandations
        feedback += "\n💡 **Recommandations:**\n"
        
        if ats_score < 50:
            feedback += "• Adapter votre CV aux mots-clés de l'offre d'emploi\n"
            feedback += "• Mettre en avant les compétences techniques requises\n"
        
        if interview_score < 6:
            feedback += "• Préparer des exemples concrets de vos réalisations\n"
            feedback += "• Développer vos réponses avec plus de détails\n"
        
        feedback += "\n✨ Bonne chance pour la suite de votre candidature !"
        
        return feedback
