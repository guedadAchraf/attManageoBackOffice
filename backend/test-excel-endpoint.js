const axios = require('axios');

async function testExcelGeneration() {
  try {
    console.log('🧪 Test de l\'endpoint Excel generation...');
    
    // D'abord, se connecter pour obtenir un token
    console.log('🔐 Connexion...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'user@att-forms.com',
      password: 'user123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    
    // Récupérer les formulaires
    console.log('📋 Récupération des formulaires...');
    const formsResponse = await axios.get('http://localhost:3001/api/forms', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const forms = formsResponse.data;
    console.log(`📊 ${forms.length} formulaire(s) trouvé(s)`);
    
    if (forms.length === 0) {
      console.log('❌ Aucun formulaire trouvé');
      return;
    }
    
    const form = forms[0];
    console.log(`📝 Test avec le formulaire: ${form.name} (ID: ${form.id})`);
    
    // Récupérer les soumissions
    console.log('📊 Récupération des soumissions...');
    const submissionsResponse = await axios.get(`http://localhost:3001/api/forms/${form.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const submissions = submissionsResponse.data;
    console.log(`📊 ${submissions.length} soumission(s) trouvée(s)`);
    
    if (submissions.length === 0) {
      console.log('❌ Aucune soumission trouvée');
      return;
    }
    
    // Tester la génération Excel
    console.log('🔄 Test de génération Excel...');
    const submissionIds = submissions.slice(0, 2).map(s => s.id); // Prendre les 2 premières
    
    const excelResponse = await axios.post(`http://localhost:3001/api/forms/${form.id}/generate-excel`, {
      submissionIds: submissionIds
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Génération Excel réussie !');
    console.log('📊 Résultat:', JSON.stringify(excelResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📊 Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testExcelGeneration();