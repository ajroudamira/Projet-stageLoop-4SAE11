import axios from 'axios';
import { Evaluation } from '../models/evaluation';

const API_URL = 'http://localhost:8089/evaluations';

class EvaluationService {
  
  getAllEvaluations() {
    return axios.get<Evaluation[]>(API_URL);
  }

  createEvaluation(evaluation: Evaluation) {
    return axios.post<Evaluation>(API_URL, evaluation);
  }


  deleteEvaluation(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  }

  getEvaluationById(id: string) {
    return axios.get<Evaluation>(`${API_URL}/${id}`); // Récupère une évaluation par ID
  }

  updateEvaluation(id: number, evaluation: Evaluation) {
    return axios.put<Evaluation>(`${API_URL}/${id}`, evaluation); // Met à jour l'évaluation
  }
  static sendEmail(email: string) {
    return axios.post(`${API_URL}/send-email?email=${email}`);
  }
}

export default new EvaluationService();
