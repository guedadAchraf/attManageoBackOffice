import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';

export async function generateOrUpdateExcelFile(
  form: any,
  newSubmissions: any[],
  user: any
) {
  console.log('🔄 Début de la génération Excel MINIMAL');
  console.log('📊 Formulaire:', form.name);
  console.log('📊 Nouvelles soumissions:', newSubmissions.length);
  console.log('👤 Utilisateur:', user.email);

  try {
    // Créer le dossier uploads
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Dossier uploads créé');
    }

    // Vérifier version existante
    const existingFile = await prisma.excelFile.findFirst({
      where: { formId: form.id, ownerId: user.id },
      orderBy: { version: 'desc' }
    });

    const newVersion = existingFile ? existingFile.version + 1 : 1;
    console.log('📄 Version:', newVersion);

    // Créer le workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(form.name);

    console.log('📋 Worksheet créé');

    // Configurer les colonnes
    const columns = form.fields.map((field: any) => ({
      header: field.label,
      key: `field_${field.id}`,
      width: 25
    }));

    worksheet.columns = columns;
    console.log('📊 Colonnes configurées:', columns.length);

    // Styliser l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    console.log('🎨 En-tête stylisé');

    // Ajouter les données
    console.log('📝 Ajout des données...');
    newSubmissions.forEach((submission, index) => {
      console.log(`  - Traitement soumission ${index + 1}`);
      
      const rowData: any = {};
      form.fields.forEach((field: any) => {
        const submissionData = submission.data as Record<string, string>;
        const value = submissionData ? submissionData[field.id.toString()] || '' : '';
        rowData[`field_${field.id}`] = value;
      });

      const dataRow = worksheet.addRow(rowData);
      dataRow.font = { size: 10 };
    });

    console.log('✅ Données ajoutées');

    // Générer le nom de fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${form.name}_v${newVersion}_${timestamp}.xlsx`;
    const filePath = path.join('uploads', fileName);
    const fullPath = path.join(process.cwd(), filePath);

    console.log('💾 Sauvegarde:', fileName);

    // Sauvegarder
    await workbook.xlsx.writeFile(fullPath);
    console.log('✅ Fichier sauvegardé');

    // Enregistrer en DB
    const excelFile = await prisma.excelFile.create({
      data: {
        fileName,
        filePath,
        ownerId: user.id,
        formId: form.id,
        version: newVersion,
        submissionsCount: newSubmissions.length
      }
    });

    console.log('✅ Enregistré en DB, ID:', excelFile.id);

    return {
      excelFile,
      isNewVersion: existingFile !== null,
      previousVersion: existingFile?.version || 0,
      newEntriesCount: newSubmissions.length,
      totalEntriesCount: newSubmissions.length
    };

  } catch (error) {
    console.error('❌ ERREUR EXCEL:', error);
    throw error;
  }
}